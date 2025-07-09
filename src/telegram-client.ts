import { TelegramClient as TGClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from "./config";

export interface MessageResult {
    handle: string;
    success: boolean;
    error?: string;
}

export class TelegramClient {
    private client: TGClient;
    private isConnected = false;

    constructor(sessionString?: string) {
        // Use provided session string, or session string from config, or empty string
        const sessionStr = sessionString || config.sessionString || "";
        const session = new StringSession(sessionStr);
        this.client = new TGClient(session, config.apiId, config.apiHash, {
            connectionRetries: 5,
        });
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            await this.client.start({
                phoneNumber: async () => config.phoneNumber,
                password: async () => {
                    throw new Error("Please run setup first: npm run setup");
                },
                phoneCode: async () => {
                    throw new Error("Please run setup first: npm run setup");
                },
                onError: (err: any) => {
                    console.error("❌ Connection error:", err);
                    throw err;
                },
            });

            this.isConnected = true;
            console.log("✅ Connected to Telegram");
        } catch (error) {
            console.error("❌ Failed to connect:", error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) return;

        await this.client.disconnect();
        this.isConnected = false;
        console.log("👋 Disconnected from Telegram");
    }

    async sendMessage(
        handle: string,
        message: string,
        retryCount: number = 0
    ): Promise<MessageResult> {
        if (!this.isConnected) {
            throw new Error("Client not connected. Call connect() first.");
        }

        try {
            // Remove @ symbol if present
            const cleanHandle = handle.startsWith("@")
                ? handle.slice(1)
                : handle;

            await this.client.sendMessage(cleanHandle, { message });

            return {
                handle,
                success: true,
            };
        } catch (error: any) {
            const errorMessage = error.message || "Unknown error";

            // Handle PEER_FLOOD with exponential backoff (max 2 retries)
            if (errorMessage.includes("PEER_FLOOD") && retryCount < 2) {
                const delay = Math.pow(2, retryCount) * 60000; // 1 min, 2 min, 4 min
                console.log(
                    `⏳ PEER_FLOOD for ${handle}, retrying in ${
                        delay / 1000
                    }s... (attempt ${retryCount + 1}/2)`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.sendMessage(handle, message, retryCount + 1);
            }

            return {
                handle,
                success: false,
                error: errorMessage,
            };
        }
    }

    async sendMessageToMultiple(
        handles: string[],
        message: string,
        onProgress?: (
            result: MessageResult,
            index: number,
            total: number
        ) => void
    ): Promise<MessageResult[]> {
        const results: MessageResult[] = [];
        const delay = 1000 / config.rateLimit; // Convert rate limit to delay in ms

        console.log(`📨 Sending message to ${handles.length} handles...`);
        console.log(`⏱️  Rate limit: ${config.rateLimit} messages/second\n`);

        for (let i = 0; i < handles.length; i++) {
            const handle = handles[i];

            try {
                const result = await this.sendMessage(handle, message);
                results.push(result);

                if (onProgress) {
                    onProgress(result, i + 1, handles.length);
                }

                // Rate limiting - wait before next message
                if (i < handles.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            } catch (error: any) {
                const result: MessageResult = {
                    handle,
                    success: false,
                    error: error.message || "Unknown error",
                };
                results.push(result);

                if (onProgress) {
                    onProgress(result, i + 1, handles.length);
                }
            }
        }

        return results;
    }

    getSessionString(): string {
        // Return the session string that was used to create the client
        return (this.client.session as StringSession).save() || "";
    }
}
