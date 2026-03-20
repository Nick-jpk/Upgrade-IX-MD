# UPGRADE IX MD 🤖

A powerful WhatsApp Multi-Device Bot with Discord integration support.

## ✨ Features

- **WhatsApp Multi-Device**: Full support for WhatsApp Web multi-device
- **Discord Integration**: Optional Discord bot functionality
- **AI Chat**: Built-in AI chat using Pollinations API
- **Group Management**: Anti-link, anti-badword, auto-admin features
- **Media Downloader**: YouTube, Instagram, TikTok downloaders
- **Auto Status View**: Automatically view and react to statuses
- **Smart Logger**: Intelligent log suppression for clean console output

## 🚀 Installation

### Prerequisites
- Node.js 18.0.0 or higher
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nick-jpk/Upgrade-IX-MD.git
cd Upgrade-IX-MD
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### Step 4: Start the Bot
```bash
npm start
```

## 🔧 Configuration

Edit `setting.js` to customize:
- Owner number
- Bot name and prefix
- Auto-react settings
- Group security features
- Bad word list

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SESSION_ID` | WhatsApp session for auto-login | No |
| `DISCORD_TOKEN` | Discord bot token | No |
| `DISCORD_PREFIX` | Discord command prefix | No |
| `NODE_ENV` | Environment mode | No |

## 🛠️ Commands

### General Commands
- `.menu` - Show command menu
- `.ping` - Check bot response time
- `.runtime` - Show bot uptime
- `.ai <text>` - Chat with AI

### Group Commands
- `.antilink` - Toggle anti-link
- `.antibadword` - Toggle anti-badword
- `.kick @user` - Remove user from group
- `.promote @user` - Promote to admin
- `.demote @user` - Demote from admin

### Download Commands
- `.yt <url>` - YouTube video downloader
- `.ig <url>` - Instagram downloader
- `.tiktok <url>` - TikTok downloader

## 🔒 Security

This bot includes anti-tampering protection. The following are protected:
- Owner number: `254748340864`
- Bot name: Must include "UPGRADE"
- Author: Must be "Toosii Tech"

## 🐛 Troubleshooting

### Common Issues

**1. Session Error / Bad MAC**
- This is normal Signal protocol noise, suppressed by the logger
- If persistent, delete the `sessions` folder and re-authenticate

**2. Dependencies Error**
```bash
rm -rf node_modules package-lock.json
npm install
```

**3. Connection Timeout**
- Check your internet connection
- Ensure port 443 is not blocked
- Try using a different network

**4. QR Code Not Showing**
- The bot uses pairing code by default
- Enter your phone number when prompted

## 📞 Support

- WhatsApp: wa.me/254724504290
- GitHub Issues: [Create an issue](https://github.com/Nick-jpk/Upgrade-IX-MD/issues)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Discord.js](https://discord.js.org/) - Discord API
- Toosii Tech - Bot development

---

**Note**: This bot is for educational purposes only. Use at your own risk and comply with WhatsApp's Terms of Service.
'''

with open('/mnt/kimi/output/Upgrade-IX-MD/README.md', 'w') as f:
    f.write(readme_content)

print("✅ README.md created successfully!")

# List all created files
import os
print("\\n📁 Files created in /mnt/kimi/output/Upgrade-IX-MD/:")
for root, dirs, files in os.walk('/mnt/kimi/output/Upgrade-IX-MD/'):
    level = root.replace('/mnt/kimi/output/Upgrade-IX-MD/', '').count(os.sep)
    indent = ' ' * 2 * level
    print(f'{indent}{os.path.basename(root)}/')
    subindent = ' ' * 2 * (level + 1)
    for file in files:
        print(f'{subindent}{file}')
