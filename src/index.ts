import { TelegramClient, MessageResult } from "./telegram-client";
import * as readlineSync from "readline-sync";
import * as fs from "fs";
import * as path from "path";

interface SendOptions {
    handles: string[];
    message: string;
    sessionString?: string;
}

function parseHandlesFromString(input: string): string[] {
    // Handle various formats: comma-separated, space-separated, newline-separated
    return input
        .split(/[,\s\n]+/)
        .map((handle) => handle.trim())
        .filter((handle) => handle.length > 0);
}

function parseHandlesFromFile(filePath: string): string[] {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return parseHandlesFromString(content);
    } catch (error: any) {
        console.error(`❌ Error reading file ${filePath}:`, error.message);
        return [];
    }
}

function displayResults(results: MessageResult[]): void {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Categorize failed results
    const peerFlood = failed.filter((r) => r.error?.includes("PEER_FLOOD"));
    const usernameNotFound = failed.filter(
        (r) =>
            r.error?.includes("No user has") ||
            r.error?.includes("Cannot find any entity") ||
            r.error?.includes("USERNAME_INVALID")
    );
    const otherErrors = failed.filter(
        (r) => !peerFlood.includes(r) && !usernameNotFound.includes(r)
    );

    console.log("\n📊 Results Summary:");
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(
        `📈 Success rate: ${(
            (successful.length / results.length) *
            100
        ).toFixed(1)}%`
    );

    if (peerFlood.length > 0) {
        console.log(
            `⏳ Rate Limited (PEER_FLOOD): ${peerFlood.length} - Can retry later`
        );
    }
    if (usernameNotFound.length > 0) {
        console.log(
            `👤 Username Not Found: ${usernameNotFound.length} - Invalid usernames`
        );
    }
    if (otherErrors.length > 0) {
        console.log(`⚠️  Other Errors: ${otherErrors.length}`);
    }

    if (failed.length > 0) {
        console.log("\n❌ Failed sends:");
        failed.forEach((result) => {
            console.log(`  • ${result.handle}: ${result.error}`);
        });
    }

    if (successful.length > 0) {
        console.log("\n✅ Successful sends:");
        successful.forEach((result) => {
            console.log(`  • ${result.handle}`);
        });
    }

    // Save retry lists
    saveRetryLists(peerFlood, usernameNotFound, otherErrors);
}

function saveRetryLists(
    peerFlood: MessageResult[],
    usernameNotFound: MessageResult[],
    otherErrors: MessageResult[]
): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    if (peerFlood.length > 0) {
        const retryContent = peerFlood.map((r) => r.handle).join("\n");
        fs.writeFileSync(`retry_peer_flood_${timestamp}.txt`, retryContent);
        console.log(
            `\n💾 Saved ${peerFlood.length} PEER_FLOOD handles to retry_peer_flood_${timestamp}.txt`
        );
    }

    if (usernameNotFound.length > 0) {
        const invalidContent = usernameNotFound
            .map((r) => `${r.handle} - ${r.error}`)
            .join("\n");
        fs.writeFileSync(`invalid_usernames_${timestamp}.txt`, invalidContent);
        console.log(
            `💾 Saved ${usernameNotFound.length} invalid usernames to invalid_usernames_${timestamp}.txt`
        );
    }

    if (otherErrors.length > 0) {
        const errorContent = otherErrors
            .map((r) => `${r.handle} - ${r.error}`)
            .join("\n");
        fs.writeFileSync(`other_errors_${timestamp}.txt`, errorContent);
        console.log(
            `💾 Saved ${otherErrors.length} other errors to other_errors_${timestamp}.txt`
        );
    }
}

function promptForHandles(): string[] {
    console.log("\nChoose how to provide handles:");
    console.log("1. Type handles manually");
    console.log("2. Load from file");
    console.log("3. Retry PEER_FLOOD handles");

    const choice = readlineSync.question("Enter choice (1, 2, or 3): ");

    if (choice === "1") {
        const input = readlineSync.question(
            "Enter handles (comma/space/newline separated): "
        );
        return parseHandlesFromString(input);
    } else if (choice === "2") {
        const filePath = readlineSync.question("Enter file path: ");
        return parseHandlesFromFile(filePath);
    } else if (choice === "3") {
        return promptForRetryFile();
    } else {
        console.log("Invalid choice. Please try again.");
        return promptForHandles();
    }
}

function promptForRetryFile(): string[] {
    const retryFiles = fs
        .readdirSync(".")
        .filter(
            (file) =>
                file.startsWith("retry_peer_flood_") && file.endsWith(".txt")
        )
        .sort((a, b) => b.localeCompare(a)); // Most recent first

    if (retryFiles.length === 0) {
        console.log(
            "❌ No retry files found. Run a mass message first to generate retry files."
        );
        return promptForHandles();
    }

    console.log("\nAvailable retry files:");
    retryFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
    });

    const choice = readlineSync.question(
        `Enter file number (1-${retryFiles.length}): `
    );
    const fileIndex = parseInt(choice) - 1;

    if (fileIndex >= 0 && fileIndex < retryFiles.length) {
        const filePath = retryFiles[fileIndex];
        console.log(`📄 Using retry file: ${filePath}`);
        return parseHandlesFromFile(filePath);
    } else {
        console.log("Invalid choice. Please try again.");
        return promptForRetryFile();
    }
}

async function sendMessages(options: SendOptions): Promise<void> {
    const client = new TelegramClient(options.sessionString);

    try {
        await client.connect();

        const results = await client.sendMessageToMultiple(
            options.handles,
            options.message,
            (result, index, total) => {
                const status = result.success ? "✅" : "❌";
                const progress = `[${index}/${total}]`;
                const handle = result.handle;
                const error = result.error ? ` (${result.error})` : "";
                console.log(`${progress} ${status} ${handle}${error}`);
            }
        );

        displayResults(results);
    } catch (error: any) {
        console.error("❌ Error:", error.message);

        if (error.message.includes("Please run setup first")) {
            console.log('\n💡 Run "npm run setup" to authenticate first');
        }
    } finally {
        await client.disconnect();
    }
}

async function main(): Promise<void> {
    console.log("🚀 Telegram Mass Messaging Tool\n");

    // Get handles
    const handles = promptForHandles();

    if (handles.length === 0) {
        console.log("❌ No valid handles provided. Exiting.");
        return;
    }

    console.log(`\n📋 Found ${handles.length} handles:`, handles.join(", "));

    // Get message
    const message = readlineSync.question("\n📝 Enter your message: ");

    if (!message.trim()) {
        console.log("❌ Empty message. Exiting.");
        return;
    }

    // Confirmation
    console.log("\n📊 Summary:");
    console.log(`📤 Recipients: ${handles.length}`);
    console.log(`📝 Message: "${message}"`);

    const confirm = readlineSync.question("\n❓ Send messages? (y/N): ");

    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
        console.log("❌ Cancelled.");
        return;
    }

    // Send messages
    await sendMessages({ handles, message });
}

if (require.main === module) {
    main().catch(console.error);
}

export { sendMessages, parseHandlesFromString, parseHandlesFromFile };
