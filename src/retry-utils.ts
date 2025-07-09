import { TelegramClient, MessageResult } from "./telegram-client";
import * as fs from "fs";

export async function retryPeerFloodHandles(
    filePath: string,
    message: string
): Promise<MessageResult[]> {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        const handles = content.split("\n").filter((h) => h.trim().length > 0);

        console.log(
            `🔄 Retrying ${handles.length} PEER_FLOOD handles from ${filePath}`
        );

        const client = new TelegramClient();
        await client.connect();

        const results = await client.sendMessageToMultiple(
            handles,
            message,
            (result, index, total) => {
                const status = result.success ? "✅" : "❌";
                const progress = `[${index}/${total}]`;
                const handle = result.handle;
                const error = result.error ? ` (${result.error})` : "";
                console.log(`${progress} ${status} ${handle}${error}`);
            }
        );

        await client.disconnect();
        return results;
    } catch (error: any) {
        console.error("❌ Error retrying PEER_FLOOD handles:", error.message);
        return [];
    }
}

export function findRetryFiles(): string[] {
    const files = fs
        .readdirSync(".")
        .filter(
            (file) =>
                file.startsWith("retry_peer_flood_") && file.endsWith(".txt")
        )
        .sort((a, b) => b.localeCompare(a)); // Most recent first

    return files;
}

export function cleanupOldRetryFiles(keepCount: number = 5): void {
    const files = findRetryFiles();

    if (files.length > keepCount) {
        const filesToDelete = files.slice(keepCount);
        filesToDelete.forEach((file) => {
            fs.unlinkSync(file);
            console.log(`🗑️  Deleted old retry file: ${file}`);
        });
    }
}
