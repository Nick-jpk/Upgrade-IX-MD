'''// setting.js - Essential configuration for UPGRADE IX MD

// Owner configuration
// Note: The anti-tampering system will ensure 254748340864 is always included
// You can add additional owner numbers here
global.owner = ['254724504290'] // Primary owner (Toosii Tech)
global.ownername = 'Victonnel Victonnel'
global.botname = 'UPGRADE IX MD'
global.botPrefix = '.' // Command prefix (e.g., .help, .menu)

// Bot behavior settings
global.fakePresence = 'online' // Options: 'typing', 'recording', 'online', 'off'
global.autoReact = true // Auto-react to messages with emoji
global.autoReactEmoji = '👍' // Default reaction emoji
global.pmBlocker = false // Block private messages (true/false)

// Group security settings
global.antiBadword = true // Delete messages with bad words
global.antiTag = true // Delete messages tagging too many people
global.antiSticker = false // Delete sticker messages

// Auto-view status settings
global.autoViewStatus = true // Auto-view WhatsApp statuses
global.autoLikeStatus = true // Auto-like statuses with reaction
global.autoReplyStatus = false // Auto-reply to status updates

// Bad words list (for anti-badword feature)
global.badWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 
  'dick', 'pussy', 'nigga', 'nigger', 'cunt',
  'whore', 'slut', 'motherfucker', 'damn'
]

// Message templates
global.mess = {
  wait: '⏳ Processing your request...',
  success: '✅ Done!',
  admin: '❌ This command is for *group admins* only!',
  botAdmin: '❌ I need to be an *admin* to perform this action!',
  owner: '❌ This command is for the *owner* only!',
  group: '❌ This command can only be used in *groups*!',
  private: '❌ This command can only be used in *private chats*!',
  error: '❌ An error occurred. Please try again later.',
  premium: '❌ This command is for *premium users* only!',
  notfound: '❌ Command not found. Type *.menu* to see available commands.',
  media: '❌ Please provide media or reply to a media message!',
  link: '❌ Please provide a valid link!'
}

// API Keys (add your own if needed)
global.apiKeys = {
  // Add your API keys here
  // openai: 'your-openai-key',
  // removebg: 'your-removebg-key',
}

// Game settings
global.gameSettings = {
  triviaTimeout: 30000, // 30 seconds for trivia answers
  mathTimeout: 20000,   // 20 seconds for math games
  wordTimeout: 45000    // 45 seconds for word games
}

// Welcome/Leave messages
global.welcomeMessage = true
global.leaveMessage = true

// Custom welcome message template
// Use @user for user mention, @group for group name
global.customWelcome = `👋 Welcome @user to @group!\\n\\nPlease read the group rules and enjoy your stay! 🎉`

// Custom leave message
global.customLeave = `👋 Goodbye @user! We hope to see you again soon.`

// Export for compatibility
module.exports = global
'''
