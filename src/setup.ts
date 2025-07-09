import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as readlineSync from "readline-sync";
import { config } from "./config";

async function setupAuth(): Promise<void> {
    console.log("🔐 Setting up Telegram authentication...\n");

    const session = new StringSession("");
    const client = new TelegramClient(session, config.apiId, config.apiHash, {
        connectionRetries: 5,
    });

    try {
        await client.start({
            phoneNumber: async () => {
                const phone = readlineSync.question(
                    "📱 Enter your phone number: "
                );
                return phone;
            },
            password: async () => {
                const password = readlineSync.question(
                    "🔒 Enter your 2FA password (press Enter if you don't have 2FA): ",
                    { hideEchoBack: true }
                );
                return password.trim() || "";
            },
            phoneCode: async () => {
                const code = readlineSync.question(
                    "📨 Enter the verification code: "
                );
                return code;
            },
            onError: (err: any) => {
                console.error("❌ Authentication error:", err);
                throw err;
            },
        });

        console.log("✅ Authentication successful!");
        console.log("📝 Session string:", client.session.save());
        console.log(
            "\n💡 Save this session string to avoid re-authentication."
        );
        console.log(
            "💡 You can add it to your .env file as SESSION_STRING=your_session_string"
        );
    } catch (error) {
        console.error("❌ Setup failed:", error);
        process.exit(1);
    } finally {
        await client.disconnect();
    }
}

if (require.main === module) {
    setupAuth().catch(console.error);
}
