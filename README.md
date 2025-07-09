# Telegram Mass Messaging Tool

A TypeScript-based tool for sending messages to multiple Telegram users by their handles/usernames using the Telegram Client API.

## ⚠️ Important Legal & Ethical Notice

-   **This tool uses the Telegram Client API** (not Bot API) to send messages from your personal account
-   **Use responsibly** and follow [Telegram's Terms of Service](https://telegram.org/tos)
-   **Only send messages to users who have consented** to receive them
-   **Be mindful of rate limits** to avoid account restrictions or bans
-   **Respect privacy** and local laws regarding automated messaging
-   **This tool is for legitimate use cases only** - no spam, harassment, or unsolicited messages

## 🚀 Quick Start Guide

### Prerequisites

-   Node.js (v16 or higher) - [Download here](https://nodejs.org/)
-   npm (comes with Node.js)
-   A Telegram account with a phone number
-   Basic command line knowledge

### 1. Get Telegram API Credentials

**Step-by-step process:**

1. **Visit [https://my.telegram.org/apps](https://my.telegram.org/apps)**
2. **Log in** with your phone number (same as your Telegram account)
3. **Create a new application** by clicking "Create new application"
4. **Fill in the form:**
    - **App title**: `Mass Messaging Tool` (or any descriptive name)
    - **Short name**: `mass-msg-tool` (or any short identifier)
    - **URL**: Leave empty
    - **Platform**: Select `Desktop`
    - **Description**: Optional, e.g., "Personal mass messaging tool"
5. **Copy your credentials:**
    - `api_id` (a number, e.g., `1234567`)
    - `api_hash` (a string, e.g., `abcdef1234567890abcdef1234567890`)

⚠️ **Keep these credentials secure** - they're like passwords for your Telegram account!

### 2. Clone and Install

```bash
# Clone the repository (if from git)
git clone <repository-url>
cd mass-tg-tool

# Install dependencies
npm install
```

### 3. Configure Environment Variables

**Create your `.env` file:**

```bash
cp .env.example .env
```

**Edit the `.env` file** with your credentials:

```env
# Telegram API credentials (from https://my.telegram.org/apps)
API_ID=1234567
API_HASH=abcdef1234567890abcdef1234567890

# Your phone number (with country code, e.g., +1234567890)
PHONE_NUMBER=+1234567890

# Optional: Session string (to avoid re-authentication)
# You'll get this after running setup - add it here to skip login next time
SESSION_STRING=

# Optional settings
SESSION_NAME=session
RATE_LIMIT=1
```

**Important notes:**

-   Use your **actual phone number** (the one linked to your Telegram account)
-   Include the **country code** (e.g., `+1` for US, `+44` for UK, `+91` for India)
-   **No quotes** around values in the `.env` file
-   **Keep this file private** - never commit it to version control

### 4. First-Time Authentication

**Run the setup script:**

```bash
npm run setup
```

**You'll be prompted for:**

1. **Phone number** - should match what's in your `.env` file
2. **Verification code** - check your Telegram app for the code
3. **2FA password** (if enabled) - your two-factor authentication password

**Example setup process:**

```bash
$ npm run setup

🔐 Setting up Telegram authentication...

📱 Enter your phone number: +1234567890
📨 Enter the verification code: 12345
🔒 Enter your 2FA password (press Enter if you don't have 2FA):
✅ Authentication successful!
📝 Session string: 1BQANOTELEAKThisSessionString...
```

**⚠️ Save the session string!** Copy it and add it to your `.env` file as `SESSION_STRING=your_session_string` to avoid re-authentication.

### 5. Build and Run

```bash
# Build the project
npm run build

# Start the tool
npm start
```

## 📱 How to Use the Tool

### Interactive Mode (Recommended)

```bash
npm start
```

**The tool will guide you through:**

1. **Choose input method:**

    - Type handles manually
    - Load from file
    - Retry previously failed handles

2. **Enter your message**

3. **Review and confirm**

4. **Monitor progress** in real-time

### Handle Input Methods

#### Method 1: Manual Input

Enter usernames separated by commas, spaces, or newlines:

```
john_doe, jane_smith, user123
```

or

```
john_doe
jane_smith
user123
```

#### Method 2: File Input

Create a text file with usernames:

**handles.txt:**

```
john_doe
jane_smith
user123
@optional_at_symbol
```

**Supported formats:**

-   One username per line
-   Comma-separated
-   Space-separated
-   Mix of formats
-   With or without `@` symbol

#### Method 3: Retry Failed Handles

The tool automatically creates retry files for failed sends:

-   `retry_peer_flood_[timestamp].txt` - For rate-limited users
-   `invalid_usernames_[timestamp].txt` - For invalid usernames
-   `other_errors_[timestamp].txt` - For other errors

### Example Usage Session

```bash
$ npm start

🚀 Telegram Mass Messaging Tool

Choose how to provide handles:
1. Type handles manually
2. Load from file
3. Retry PEER_FLOOD handles
Enter choice (1, 2, or 3): 2

Enter file path: handles.txt

📋 Found 5 handles: john_doe, jane_smith, user123, invalid_user, rate_limited_user

📝 Enter your message: Hello! This is a test message from the mass messaging tool.

📊 Summary:
📤 Recipients: 5
📝 Message: "Hello! This is a test message from the mass messaging tool."

❓ Send messages? (y/N): y

✅ Connected to Telegram
📨 Sending message to 5 handles...
⏱️  Rate limit: 1 messages/second

[1/5] ✅ john_doe
[2/5] ✅ jane_smith
[3/5] ✅ user123
[4/5] ❌ invalid_user (Cannot find any entity corresponding to "invalid_user")
[5/5] ❌ rate_limited_user (A wait of 86400 seconds is required (caused by SendMessageRequest))

📊 Results Summary:
✅ Successful: 3
❌ Failed: 2
📈 Success rate: 60.0%
⏳ Rate Limited (PEER_FLOOD): 1 - Can retry later
👤 Username Not Found: 1 - Invalid usernames

❌ Failed sends:
  • invalid_user: Cannot find any entity corresponding to "invalid_user"
  • rate_limited_user: A wait of 86400 seconds is required (caused by SendMessageRequest)

✅ Successful sends:
  • john_doe
  • jane_smith
  • user123

💾 Saved 1 PEER_FLOOD handles to retry_peer_flood_2024-01-15T10-30-45-123Z.txt
💾 Saved 1 invalid usernames to invalid_usernames_2024-01-15T10-30-45-123Z.txt
```

## 🔧 Configuration Options

### Environment Variables

| Variable         | Description                            | Example               | Required | Default   |
| ---------------- | -------------------------------------- | --------------------- | -------- | --------- |
| `API_ID`         | Telegram API ID from my.telegram.org   | `1234567`             | ✅ Yes   | -         |
| `API_HASH`       | Telegram API Hash from my.telegram.org | `abcdef123...`        | ✅ Yes   | -         |
| `PHONE_NUMBER`   | Your phone number with country code    | `+1234567890`         | ✅ Yes   | -         |
| `SESSION_STRING` | Session string from setup (optional)   | `1BQANOTELEAKThis...` | ❌ No    | -         |
| `SESSION_NAME`   | Session file name                      | `session`             | ❌ No    | `session` |
| `RATE_LIMIT`     | Messages per second                    | `1`                   | ❌ No    | `1`       |

### Rate Limiting Recommendations

| Use Case          | Recommended Rate | Risk Level                |
| ----------------- | ---------------- | ------------------------- |
| **Personal use**  | `1` msg/sec      | ✅ Low                    |
| **Small batches** | `0.5` msg/sec    | ✅ Very Low               |
| **Large batches** | `0.33` msg/sec   | ✅ Minimal                |
| **High volume**   | `2` msg/sec      | ⚠️ Medium                 |
| **Aggressive**    | `5` msg/sec      | ❌ High (not recommended) |

## 🚨 Error Handling & Troubleshooting

### Common Error Types

#### 1. **Username/Entity Not Found Errors**

**Error messages:**

-   `Cannot find any entity corresponding to "username"`
-   `No user has "username" as username`
-   `USERNAME_INVALID`

**Causes:**

-   Username doesn't exist
-   User changed their username
-   User deleted their account
-   Username is typed incorrectly
-   User has privacy settings preventing discovery

**Solutions:**

-   Verify the username exists by searching in Telegram
-   Check for typos in the username
-   Remove invalid usernames from your list
-   These users will be saved to `invalid_usernames_[timestamp].txt`

#### 2. **Rate Limiting / PEER_FLOOD Errors**

**Error messages:**

-   `A wait of [seconds] seconds is required (caused by SendMessageRequest)`
-   `PEER_FLOOD`
-   `Too many requests`

**Causes:**

-   Telegram detected automated behavior
-   Sending too many messages too quickly
-   Your account is temporarily restricted
-   Recent similar activity triggered limits

**Solutions:**

-   **Immediate**: Users are saved to `retry_peer_flood_[timestamp].txt`
-   **Wait**: The error shows how long to wait (usually 24-48 hours)
-   **Retry**: Use the retry option to resend to these users later
-   **Reduce rate**: Lower your `RATE_LIMIT` in `.env`
-   **Gradual increase**: Start with small batches, increase slowly

#### 3. **Authentication Errors**

**Error messages:**

-   `Please run setup first`
-   `AUTH_KEY_INVALID`
-   `SESSION_EXPIRED`

**Causes:**

-   Haven't run initial setup
-   Session expired
-   Invalid API credentials
-   Account security changes

**Solutions:**

-   Run `npm run setup` to authenticate
-   Check API credentials in `.env`
-   Delete old session files and re-authenticate
-   Verify your phone number is correct

#### 4. **Network/Connection Errors**

**Error messages:**

-   `Connection failed`
-   `Network error`
-   `Timeout`

**Causes:**

-   Internet connection issues
-   Telegram servers temporarily down
-   Firewall blocking connection
-   VPN/proxy issues

**Solutions:**

-   Check your internet connection
-   Try again later
-   Disable VPN/proxy if using one
-   Check firewall settings

#### 5. **400 Bad Request Errors**

**Error messages:**

-   `400 Bad Request`
-   `Invalid request`
-   `Malformed request`

**Causes:**

-   Invalid message format
-   Message too long (>4096 characters)
-   Invalid characters in message
-   Corrupted session data

**Solutions:**

-   Check message length (max 4096 characters)
-   Remove special characters that might cause issues
-   Re-authenticate if session is corrupted
-   Verify message encoding (use UTF-8)

### Advanced Troubleshooting

#### Session Issues

```bash
# Delete session files and re-authenticate
rm -f session*
npm run setup
```

#### Permission Issues

```bash
# Check file permissions
ls -la .env
chmod 600 .env  # Make .env readable only by you
```

#### Dependency Issues

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Environment Issues

```bash
# Check environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.API_ID)"
```

### Rate Limiting Best Practices

1. **Start Small**: Begin with 5-10 users to test
2. **Monitor Results**: Watch for error patterns
3. **Gradual Scaling**: Increase batch sizes slowly
4. **Time Spacing**: Spread campaigns across days
5. **Account Age**: Older accounts have higher limits
6. **Clean Lists**: Remove invalid users promptly

### Error Recovery Strategies

#### For PEER_FLOOD:

1. **Stop immediately** when you see these errors
2. **Wait the specified time** (usually 24-48 hours)
3. **Use retry files** to continue later
4. **Reduce rate limit** for future sends

#### For Invalid Usernames:

1. **Review the list** in `invalid_usernames_[timestamp].txt`
2. **Clean your source data** to remove invalid entries
3. **Update your handles file** with corrected usernames

#### For Connection Issues:

1. **Check logs** for patterns
2. **Retry after delays** (exponential backoff)
3. **Monitor success rates** to detect issues early

## 🛠️ Development & Scripts

### Available Commands

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run the production build
npm start

# First-time authentication setup
npm run setup

# Clean build artifacts
npm run clean  # (if available)
```

### Project Structure

```
mass-tg-tool/
├── src/
│   ├── config.ts          # Environment configuration
│   ├── index.ts           # Main application logic
│   ├── setup.ts           # Authentication setup
│   ├── telegram-client.ts # Telegram API wrapper
│   └── retry-utils.ts     # Retry functionality
├── dist/                  # Compiled JavaScript (auto-generated)
├── .env                   # Your credentials (keep private!)
├── .env.example          # Template for .env
├── handles.txt           # Your usernames list
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### File Descriptions

-   **`src/config.ts`**: Loads and validates environment variables
-   **`src/index.ts`**: Main CLI interface and orchestration
-   **`src/telegram-client.ts`**: Telegram API wrapper with error handling
-   **`src/setup.ts`**: Interactive authentication setup
-   **`src/retry-utils.ts`**: Utilities for retrying failed sends
-   **`handles.txt`**: Your list of usernames (create this file)
-   **`.env`**: Your private configuration (never commit this!)

## 📊 Understanding Results

### Success Metrics

The tool provides detailed metrics after each run:

```
📊 Results Summary:
✅ Successful: 45        # Messages sent successfully
❌ Failed: 15           # Messages that failed
📈 Success rate: 75.0%  # Percentage of successful sends
⏳ Rate Limited: 8      # PEER_FLOOD errors (can retry later)
👤 Username Not Found: 5 # Invalid usernames
⚠️  Other Errors: 2     # Other issues (network, etc.)
```

### Generated Files

After each run, the tool creates timestamped files:

-   **`retry_peer_flood_[timestamp].txt`**: Users to retry after rate limit expires
-   **`invalid_usernames_[timestamp].txt`**: Invalid usernames with error details
-   **`other_errors_[timestamp].txt`**: Other errors requiring investigation

### What Success Rate to Expect

| Success Rate | Interpretation                                     |
| ------------ | -------------------------------------------------- |
| **90%+**     | Excellent - Clean user list, good account standing |
| **75-90%**   | Good - Some invalid users, normal operation        |
| **50-75%**   | Fair - Many invalid users or rate limiting         |
| **25-50%**   | Poor - Major issues with user list or account      |
| **<25%**     | Critical - Stop and investigate immediately        |

## 🔐 Security & Privacy

### Protecting Your Credentials

1. **Never commit `.env`** to version control
2. **Use strong passwords** for your Telegram account
3. **Enable 2FA** on your Telegram account
4. **Keep session strings private** - they're like passwords
5. **Monitor account activity** for unauthorized access

### Safe Usage Practices

1. **Test with small batches** before large deployments
2. **Monitor for unusual account behavior**
3. **Don't share session strings** with others
4. **Use from trusted networks** only
5. **Regularly rotate API credentials** if possible

### Legal Considerations

-   **Obtain consent** before messaging users
-   **Follow local privacy laws** (GDPR, CCPA, etc.)
-   **Respect Telegram's Terms of Service**
-   **Don't use for spam or harassment**
-   **Keep records** of consent and opt-outs

## 🤝 Support & Contributing

### Getting Help

If you encounter issues:

1. **Check this README** for common solutions
2. **Review error messages** carefully
3. **Try basic troubleshooting** steps
4. **Check GitHub issues** for similar problems
5. **Create detailed bug reports** with logs

### Contributing

Contributions are welcome! Please:

1. **Fork the repository**
2. **Create a feature branch**
3. **Test thoroughly**
4. **Follow coding standards**
5. **Submit a pull request**

### Reporting Issues

When reporting issues, include:

-   **Error messages** (full text)
-   **Steps to reproduce**
-   **Environment details** (OS, Node version)
-   **Configuration** (without credentials)
-   **Expected vs actual behavior**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

-   Built with the [Telegram Client API](https://core.telegram.org/api)
-   Uses [GramJS](https://gram.js.org/) for Telegram connectivity
-   Inspired by the need for efficient, ethical mass messaging

---

**Remember**: With great power comes great responsibility. Use this tool ethically and responsibly! 🚀
