import * as dotenv from "dotenv";

dotenv.config();

export interface Config {
    apiId: number;
    apiHash: string;
    phoneNumber: string;
    sessionName: string;
    sessionString?: string;
    rateLimit: number;
}

function validateConfig(): Config {
    const apiId = process.env.API_ID;
    const apiHash = process.env.API_HASH;
    const phoneNumber = process.env.PHONE_NUMBER;

    if (!apiId || !apiHash || !phoneNumber) {
        throw new Error(
            "Missing required environment variables. Please check your .env file.\n" +
                "Required: API_ID, API_HASH, PHONE_NUMBER\n" +
                "Get API credentials from: https://my.telegram.org/apps"
        );
    }

    return {
        apiId: parseInt(apiId, 10),
        apiHash,
        phoneNumber,
        sessionName: process.env.SESSION_NAME || "session",
        sessionString: process.env.SESSION_STRING,
        rateLimit: parseInt(process.env.RATE_LIMIT || "1", 10),
    };
}

export const config = validateConfig();
