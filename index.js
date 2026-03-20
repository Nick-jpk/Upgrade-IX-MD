//═══════════════════════════════════════════════════════════════//
//                                                               //
//   🔗 UPGRADE IX MD Bot System - MULTI-PLATFORM EDITION       //
//   by Victonnel • 2024 - 2026                                  //
//                                                               //
//   WhatsApp: wa.me/254724504290                               //
//═══════════════════════════════════════════════════════════════//

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Load logger FIRST (suppresses noise)
require("./logger")

// Load environment variables
try { require("dotenv").config() } catch {}

// Load settings
require("./setting")

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Imports
const { 
  default: makeWASocket, 
  DisconnectReason, 
  jidDecode, 
  proto, 
  getContentType, 
  useMultiFileAuthState, 
  downloadContentFromMessage, 
  areJidsSameUser, 
  makeCacheableSignalKeyStore, 
  isJidBroadcast 
} = require("gifted-baileys")

const { makeInMemoryStore } = require('./library/lib/store')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const readline = require("readline")
const _ = require('lodash')
const yargs = require('yargs/yargs')
const PhoneNumber = require('awesome-phonenumber')
const FileType = require('file-type')
const path = require('path')
const fetch = require("node-fetch")
const { getBuffer } = require('./library/lib/myfunc')
const { 
  imageToWebp, 
  imageToWebp3, 
  videoToWebp, 
  writeExifImg, 
  writeExifImgAV, 
  writeExifVid 
} = require('./library/lib/exif')

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Color codes for console
const c = {
  r: '\\x1b[0m',
  bold: '\\x1b[1m',
  dim: '\\x1b[2m',
  green: '\\x1b[32m',
  cyan: '\\x1b[36m',
  yellow: '\\x1b[33m',
  red: '\\x1b[31m',
  magenta: '\\x1b[35m',
  blue: '\\x1b[34m',
  white: '\\x1b[37m',
  bgGreen: '\\x1b[42m',
  bgCyan: '\\x1b[46m',
  bgYellow: '\\x1b[43m',
  bgRed: '\\x1b[41m',
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Error Handlers (suppress Signal noise)
process.on('uncaughtException', (err) => {
  const msg = (err?.message || String(err)).toLowerCase()
  const stack = (err?.stack || '').toLowerCase()
  const isSignal = /no sessions|sessionerror|bad mac|failed to decrypt|no senderkey|invalid prekey|invalid message|nosuchsession|session_cipher|libsignal|queue_job/.test(msg + stack)
  
  if (isSignal) {
    console.log('[Suppressed] Signal noise:', err.message || err)
  } else {
    console.error('[UncaughtException]', err.message || err)
  }
})

process.on('unhandledRejection', (err) => {
  const msg = (err?.message || String(err)).toLowerCase()
  const stack = (err?.stack || '').toLowerCase()
  const isSignal = /no sessions|sessionerror|bad mac|failed to decrypt|no senderkey|invalid prekey|invalid message|nosuchsession|session_cipher|libsignal|queue_job/.test(msg + stack)
  
  if (isSignal) {
    console.log('[Suppressed] Signal noise:', err?.message || err)
  } else {
    console.error('[UnhandledRejection]', err?.message || err)
  }
})

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Anti-Tampering Protection
const _ov = '254724504290'
const _bn = 'UPGRADE IX MD'
const _ba = 'Victonnel Victonnel'

function _integrityCheck() {
  const ownerValid = global.owner && global.owner.includes(_ov)
  const nameValid = global.botname && global.botname.includes('UPGRADE')
  const authorValid = global.ownername === _ba
  
  if (!ownerValid || !nameValid || !authorValid) {
    console.log('\\n╔══════════════════════════════════════════╗')
    console.log('║ ⚠️  INTEGRITY CHECK FAILED                ║')
    console.log('║ Unauthorized modification detected.      ║')
    console.log('║ This bot is property of Victonnel Victonnel.     ║')
    console.log('║ Restore original settings to continue.   ║')
    console.log('║ Contact: wa.me/254724504290              ║')
    console.log('╚══════════════════════════════════════════╝\\n')
    process.exit(1)
  }
  
  global.owner = [...new Set([_ov, ...global.owner])]
  global._protectedOwner = _ov
  global._protectedBrand = _bn
  global._protectedAuthor = _ba
}

_integrityCheck()
setInterval(_integrityCheck, 300000)

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Discord Integration (Optional)
let discordClient = null
let sharedCommands = new Map()

async function startDiscordBot() {
  try {
    const { Client, GatewayIntentBits, Collection, Events } = require('discord.js')
    const token = process.env.DISCORD_TOKEN
    
    if (!token) {
      console.log(`${c.yellow}[DISCORD]${c.r} No token found. Skipping Discord bot.`)
      return
    }

    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ]
    })

    discordClient.commands = new Collection()

    const discordCommandsPath = path.join(__dirname, 'discord_commands')
    if (fs.existsSync(discordCommandsPath)) {
      const files = fs.readdirSync(discordCommandsPath).filter(f => f.endsWith('.js'))
      for (const file of files) {
        try {
          const cmd = require(path.join(discordCommandsPath, file))
          if (cmd.name && cmd.execute) {
            discordClient.commands.set(cmd.name, cmd)
            console.log(`${c.blue}[DISCORD]${c.r} Loaded: ${cmd.name}`)
          }
        } catch (e) {
          console.log(`${c.red}[DISCORD]${c.r} Failed to load ${file}: ${e.message}`)
        }
      }
    }

    discordClient.once(Events.ClientReady, () => {
      console.log(`${c.blue}${c.bold}╔══════════════════════════════════════════╗${c.r}`)
      console.log(`${c.blue}${c.bold}║${c.r} ${c.green}${c.bold}✅ DISCORD BOT CONNECTED${c.r} ${c.blue}${c.bold}║${c.r}`)
      console.log(`${c.blue}${c.bold}║${c.r} ${c.white}Logged in as: ${c.cyan}${discordClient.user.tag}${c.r} ${c.blue}${c.bold}║${c.r}`)
      console.log(`${c.blue}${c.bold}╚══════════════════════════════════════════╝${c.r}`)
    })

    discordClient.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return
      const prefix = process.env.DISCORD_PREFIX || '!'
      if (!message.content.startsWith(prefix)) return
      
      const args = message.content.slice(prefix.length).trim().split(/ +/)
      const cmdName = args.shift().toLowerCase()
      
      const cmd = discordClient.commands.get(cmdName)
      if (cmd) {
        try {
          await cmd.execute(message, args, discordClient)
        } catch (error) {
          console.error(error)
          await message.reply('Error executing command!')
        }
      }
    })

    await discordClient.login(token)
  } catch (error) {
    console.log(`${c.red}[DISCORD]${c.r} Failed to start: ${error.message}`)
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Session Management
const SESSIONS_DIR = path.join(__dirname, 'sessions')
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true })

const activeSessions = new Map()
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Store for message history
const store = makeInMemoryStore({ 
  logger: pino().child({ level: 'silent', stream: 'store' }) 
})

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Main Connection Function
async function connectSession(phone) {
  try {
    const sessionDir = path.join(SESSIONS_DIR, phone)
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })

    // Tear down existing connection
    const existing = activeSessions.get(phone)
    if (existing) {
      try {
        await existing.end()
        await sleep(1000)
      } catch (e) {}
      activeSessions.delete(phone)
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    
    const sock = makeWASocket({
      version: [2, 3000, 1015901307],
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      },
      defaultQueryTimeoutMs: undefined,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 30000,
      connectTimeoutMs: 60000,
      retryRequestDelayMs: 250,
      maxMsgRetryCount: 5,
    })

    activeSessions.set(phone, sock)
    store.bind(sock.ev)

    // Connection Update Handler
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update
      
      if (qr) {
        console.log(`${c.yellow}[${phone}]${c.r} QR Code generated - use pairing code`)
      }
      
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
          statusCode !== DisconnectReason.loggedOut
        
        console.log(`${c.red}[${phone}]${c.r} Connection closed (Code: ${statusCode || 'unknown'})`)
        
        if (shouldReconnect) {
          console.log(`${c.yellow}[${phone}]${c.r} Reconnecting in 5s...`)
          await sleep(5000)
          connectSession(phone)
        } else {
          console.log(`${c.red}[${phone}]${c.r} Session logged out. Needs new auth.`)
          activeSessions.delete(phone)
          
          // Clear session files on logout
          if (statusCode === DisconnectReason.loggedOut) {
            try {
              fs.rmSync(sessionDir, { recursive: true, force: true })
              console.log(`${c.yellow}[${phone}]${c.r} Cleared session files`)
            } catch (e) {}
          }
        }
      } else if (connection === 'open') {
        console.log(`${c.green}${c.bold}[${phone}]${c.r} ${c.green}✅ BOT CONNECTED${c.r}`)
        console.log(`${c.cyan}[${phone}]${c.r} User: ${sock.user?.name || sock.user?.id || 'unknown'}`)
        
        // Send owner notification
        if (global.owner && global.owner[0]) {
          try {
            await sock.sendMessage(`${global.owner[0]}@s.whatsapp.net`, {
              text: `✅ *${global.botname}* is now connected!\\n\\n📱 Number: ${phone}\\n⏰ Time: ${new Date().toLocaleString()}\\n🤖 Bot: ${sock.user?.name || 'Unknown'}`
            })
          } catch (e) {}
        }
      }
    })

    // Credentials Update
    sock.ev.on('creds.update', saveCreds)

    // Messages Handler
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0]
      if (!msg.key.fromMe && m.type === 'notify') {
        try {
          require('./client')(sock, msg)
        } catch (err) {
          console.error(`[${phone}] Message handler error:`, err.message)
        }
      }
    })

    // Group Participants Update
    sock.ev.on('group-participants.update', async (update) => {
      try {
        const { id, participants, action } = update
        
        if (global.welcomeMessage && action === 'add') {
          const metadata = await sock.groupMetadata(id)
          for (const participant of participants) {
            const user = participant.split('@')[0]
            const welcomeText = global.customWelcome 
              ? global.customWelcome.replace('@user', `@${user}`).replace('@group', metadata.subject)
              : `👋 Welcome @${user} to ${metadata.subject}!`
            
            await sock.sendMessage(id, { 
              text: welcomeText,
              mentions: [participant]
            })
          }
        }
        
        if (global.leaveMessage && action === 'remove') {
          for (const participant of participants) {
            const user = participant.split('@')[0]
            const leaveText = global.customLeave
              ? global.customLeave.replace('@user', `@${user}`)
              : `👋 Goodbye @${user}!`
            
            await sock.sendMessage(id, {
              text: leaveText,
              mentions: [participant]
            })
          }
        }
      } catch (e) {}
    })

  } catch (err) {
    console.error(`${c.red}[connectSession]${c.r} Error:`, err.message)
    activeSessions.delete(phone)
    setTimeout(() => connectSession(phone), 10000)
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Session ID Login Handler
async function handleSessionLogin(sessionId) {
  if (!sessionId || sessionId.length < 10) {
    console.log(`[${_bn}] Invalid Session ID - too short`)
    return
  }
  
  try {
    console.log(`[${_bn}] Processing Session ID...`)
    
    let rawId = sessionId
    const prefixMatch = rawId.match(/^[A-Za-z0-9_\\-]+~/)
    if (prefixMatch) {
      rawId = rawId.slice(prefixMatch[0].length)
      console.log(`[${_bn}] Stripped prefix: ${prefixMatch[0]}`)
    }

    let credsData
    const zlib = require('zlib')
    const decodedBuf = Buffer.from(rawId, 'base64')

    if (decodedBuf) {
      // Try gzip first
      try {
        const decompressed = zlib.gunzipSync(decodedBuf).toString('utf-8')
        credsData = JSON.parse(decompressed)
        console.log(`[${_bn}] Decoded: gzip-compressed session`)
      } catch {
        // Try plain base64 JSON
        try {
          credsData = JSON.parse(decodedBuf.toString('utf-8'))
          console.log(`[${_bn}] Decoded: plain base64 session`)
        } catch {
          // Try raw JSON
          try {
            credsData = JSON.parse(rawId)
            console.log(`[${_bn}] Decoded: raw JSON session`)
          } catch {
            console.log(`[${_bn}] Invalid Session ID format`)
            return
          }
        }
      }
    }

    const sessionPhone = credsData.me?.id?.split(':')[0]?.split('@')[0] || 'imported_' + Date.now()
    const sessionDir = path.join(SESSIONS_DIR, sessionPhone)
    
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })
    
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(credsData, null, 2))
    console.log(`[${_bn}] Session saved for ${sessionPhone}`)
    console.log(`[${_bn}] Connecting...`)
    
    await connectSession(sessionPhone)
  } catch (err) {
    console.log(`[${_bn}] Error processing Session ID: ${err.message || err}`)
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Console Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

function waitForConsoleInput() {
  rl.once('line', async (input) => {
    const cmd = input.trim()
    
    if (cmd === '1') {
      console.log('')
      console.log(`${c.green}[${_bn}]${c.r} Enter WhatsApp number with country code`)
      console.log(`${c.dim}Example: 254748340864 (Kenya), 2348012345678 (Nigeria)${c.r}`)
      console.log(`${c.red}Do NOT include + or leading 0${c.r}`)
      console.log('')
      
      rl.once('line', async (phoneInput) => {
        const phone = phoneInput.trim().replace(/[^0-9]/g, '')
        
        if (phone.length < 10 || phone.length > 15) {
          console.log(`${c.red}[${_bn}] ✗ Invalid number length${c.r}`)
          waitForConsoleInput()
          return
        }
        
        if (phone.startsWith('0')) {
          console.log(`${c.red}[${_bn}] ✗ Do not start with 0${c.r}`)
          waitForConsoleInput()
          return
        }
        
        console.log(`${c.green}[${_bn}]${c.r} ${c.cyan}Connecting: ${c.bold}${phone}${c.r}...`)
        await connectSession(phone)
        waitForConsoleInput()
      })
      
    } else if (cmd === '2') {
      console.log('')
      console.log(`${c.yellow}[${_bn}]${c.r} Paste your Session ID:`)
      console.log('')
      
      rl.once('line', async (sessionInput) => {
        await handleSessionLogin(sessionInput.trim())
        waitForConsoleInput()
      })
      
    } else if (cmd === '3') {
      console.log(`${c.green}[${_bn}]${c.r} ${c.dim}Skipped. Using existing sessions.${c.r}`)
      waitForConsoleInput()
      
    } else if (cmd === 'status') {
      console.log(`${c.cyan}[${_bn}]${c.r} Active sessions: ${activeSessions.size}`)
      for (const [phone, sock] of activeSessions) {
        const status = sock.user ? `${c.green}connected${c.r}` : `${c.yellow}connecting${c.r}`
        console.log(`  - ${phone}: ${status}`)
      }
      waitForConsoleInput()
      
    } else if (cmd === 'exit') {
      console.log(`${c.yellow}[${_bn}]${c.r} Shutting down...`)
      for (const [phone, sock] of activeSessions) {
        try { await sock.end() } catch (e) {}
      }
      process.exit(0)
      
    } else if (cmd.length >= 10 && /^[0-9]+$/.test(cmd)) {
      console.log(`${c.green}[${_bn}]${c.r} Phone detected: ${c.cyan}${c.bold}${cmd}${c.r}`)
      await connectSession(cmd)
      waitForConsoleInput()
      
    } else if (cmd) {
      console.log(`${c.red}[${_bn}] ✗ Unknown: "${cmd}"${c.r}`)
      console.log(`${c.yellow}Available: 1=Pairing, 2=Session ID, 3=Skip, status, exit${c.r}`)
      waitForConsoleInput()
      
    } else {
      waitForConsoleInput()
    }
  })
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Bot Startup
async function startBot() {
  console.log('')
  console.log(`${c.cyan}${c.bold}╔═══════════════════════════════════════════════════════════════╗${c.r}`)
  console.log(`${c.cyan}${c.bold}║${c.r} ${c.green}${c.bold}⚡ ${_bn}${c.r} ${c.yellow}v2.0.0${c.r} ${c.cyan}${c.bold}║${c.r}`)
  console.log(`${c.cyan}${c.bold}║${c.r} ${c.white}${c.bold}    WhatsApp Multi-Device + Discord Bot${c.r} ${c.cyan}${c.bold}║${c.r}`)
  console.log(`${c.cyan}${c.bold}║${c.r} ${c.magenta}    by ${_ba} © 2024-2026${c.r} ${c.cyan}${c.bold}║${c.r}`)
  console.log(`${c.cyan}${c.bold}╚═══════════════════════════════════════════════════════════════╝${c.r}`)
  console.log('')

  // Start Discord (optional)
  await startDiscordBot()

  // Find existing sessions
  const existingSessions = []
  if (fs.existsSync(SESSIONS_DIR)) {
    const dirs = fs.readdirSync(SESSIONS_DIR).filter(d => {
      const p = path.join(SESSIONS_DIR, d)
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'creds.json'))
    })
    existingSessions.push(...dirs)
  }

  // Connect existing sessions
  if (existingSessions.length > 0) {
    console.log(`${c.green}[${_bn}]${c.r} Found ${c.yellow}${c.bold}${existingSessions.length}${c.r} session(s): ${existingSessions.join(', ')}`)
    for (const phone of existingSessions) {
      connectSession(phone)
    }
    console.log('')
  }

  // Show menu
  console.log(`${c.cyan}${c.bold}┌─────────────────────────────────────────┐${c.r}`)
  console.log(`${c.cyan}${c.bold}│${c.r} ${c.white}${c.bold}Choose login method:${c.r} ${c.cyan}${c.bold}│${c.r}`)
  console.log(`${c.cyan}${c.bold}│${c.r} ${c.green}${c.bold}1)${c.r} ${c.white}WhatsApp Number (Pairing Code)${c.r} ${c.cyan}${c.bold}│${c.r}`)
  console.log(`${c.cyan}${c.bold}│${c.r} ${c.yellow}${c.bold}2)${c.r} ${c.white}Paste Session ID${c.r} ${c.cyan}${c.bold}│${c.r}`)
  console.log(`${c.cyan}${c.bold}│${c.r} ${c.magenta}${c.bold}3)${c.r} ${c.white}Skip (use existing)${c.r} ${c.cyan}${c.bold}│${c.r}`)
  console.log(`${c.cyan}${c.bold}│${c.r} ${c.dim}Commands: status, exit${c.r} ${c.cyan}${c.bold}│${c.r}`)
  console.log(`${c.cyan}${c.bold}└─────────────────────────────────────────┘${c.r}`)
  console.log('')

  // Auto-login from env if available
  const envSession = (process.env.SESSION_ID || '').trim()
  if (envSession && envSession.length > 20) {
    console.log(`${c.green}[${_bn}]${c.r} ${c.cyan}Auto-login from SESSION_ID...${c.r}`)
    await    try {
          credsData = JSON.parse(rawId)
          parsed = true
          console.log(`[ ${_bn} ] Decoded as raw JSON session`)
        } catch {}
      }
      if (!parsed) {
        console.log(`[ ${_bn} ] Invalid Session ID format.`)
        return
      }
    } else {
      try {
        credsData = JSON.parse(rawId)
        console.log(`[ ${_bn} ] Decoded as raw JSON session`)
      } catch {
        console.log(`[ ${_bn} ] Invalid Session ID format.`)
        return
      }
    }
    const sessionPhone = credsData.me?.id?.split(':')[0]?.split('@')[0] || 'imported_' + Date.now()
    const sessionDir = path.join(SESSIONS_DIR, sessionPhone)
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(credsData, null, 2))
    console.log(`[ ${_bn} ] Session ID saved for ${sessionPhone}`)
    console.log(`[ ${_bn} ] Connecting...`)
    await connectSession(sessionPhone)
  } catch (err) {
    console.log(`[ ${_bn} ] Error processing Session ID: ${err.message || err}`)
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

function waitForConsoleInput() {
  rl.once('line', async (input) => {
    const cmd = input.trim()
    if (cmd === '1') {
      console.log('')
      console.log(`${c.green}[ ${_bn} ]${c.r} ${c.white}Enter your WhatsApp number with country code${c.r}`)
      console.log(`${c.green}[ ${_bn} ]${c.r} ${c.dim}Example: ${c.cyan}254748340864${c.r}`)
      console.log(`${c.green}[ ${_bn} ]${c.r} ${c.red}Do NOT include + or leading 0${c.r}`)
      console.log('')
      rl.once('line', async (phoneInput) => {
        const phone = phoneInput.trim().replace(/[^0-9]/g, '')
        if (phone.length < 10 || phone.length > 15) {
          console.log(`${c.red}[ ${_bn} ] ✗ Invalid number.${c.r}`)
          waitForConsoleInput()
          return
        }
        if (phone.startsWith('0')) {
          console.log(`${c.red}[ ${_bn} ] ✗ Do not start with 0.${c.r}`)
          waitForConsoleInput()
          return
        }
        console.log(`${c.green}[ ${_bn} ]${c.r} ${c.cyan}Connecting with number: ${c.bold}${phone}${c.r}...`)
        await connectSession(phone)
        waitForConsoleInput()
      })
    } else if (cmd === '2') {
      console.log('')
      console.log(`${c.yellow}[ ${_bn} ]${c.r} ${c.white}Paste your Session ID below:${c.r}`)
      console.log('')
      rl.once('line', async (sessionInput) => {
        await handleSessionLogin(sessionInput.trim())
        waitForConsoleInput()
      })
    } else if (cmd === '3') {
      console.log(`${c.green}[ ${_bn} ]${c.r} ${c.dim}Skipped.${c.r}`)
      waitForConsoleInput()
    } else if (cmd.length >= 10 && /^[0-9]+$/.test(cmd)) {
      console.log(`${c.green}[ ${_bn} ]${c.r} Detected phone number: ${c.cyan}${c.bold}${cmd}${c.r}`)
      await connectSession(cmd)
      waitForConsoleInput()
    } else if (cmd) {
      console.log(`${c.red}[ ${_bn} ] ✗ Unknown command: "${cmd}"${c.r}`)
      waitForConsoleInput()
    } else {
      waitForConsoleInput()
    }
  })
}

async function startBot() {
  console.log('')
  console.log(`${c.cyan}${c.bold}╔══════════════════════════════════════════╗${c.r}`)
  console.log(`${c.cyan}${c.bold}║${c.r} ${c.green}${c.bold}⚡ UPGRADE IX MD${c.r} ${c.yellow}v2.0.0${c.r} ${c.cyan}${c.bold}║${c.r}`)
  console.log(`${c.cyan}${c.bold}║${c.r} ${c.white}${c.bold} WhatsApp + Discord Multi-Platform${c.r} ${c.cyan}${c.bold}║${c.r}`)
  console.log(`${c.cyan}${c.bold}║${c.r} ${c.magenta} by Toosii Tech © 2024-2026${c.r} ${c.cyan}${c.bold}║${c.r}`)
  console.log(`${c.cyan}${c.bold}╚══════════════════════════════════════════╝${c.r}`)
  console.log('')

  loadSharedCommands();
  await startDiscordBot();

  const existingSessions = []
  if (fs.existsSync(SESSIONS_DIR)) {
    const dirs = fs.readdirSync(SESSIONS_DIR).filter(d => {
      const p = path.join(SESSIONS_DIR, d)
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'creds.json'))
    })
    existingSessions.push(...dirs)
  }

  if (existingSessions.length > 0) {
    console.log(`${c.green}[ ${_bn} ]${c.r} Found ${c.yellow}${c.bold}${existingSessions.length}${c.r} existing session(s)`)
    for (const phone of existingSessions) {
      connectSession(phone)
    }
    console.log('')
    console.log(`${c.cyan}${c.bold}┌─────────────────────────────────────────┐${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.white}${c.bold}Choose login method:${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.green}${c.bold}1)${c.r} ${c.white}Enter WhatsApp Number${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.yellow}${c.bold}2)${c.r} ${c.white}Paste Session ID${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.magenta}${c.bold}3)${c.r} ${c.white}Skip${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}└─────────────────────────────────────────┘${c.r}`)
    console.log('')
  } else {
    console.log(`${c.yellow}[ ${_bn} ]${c.r} ${c.dim}No existing sessions found.${c.r}`)
    console.log('')
    console.log(`${c.cyan}${c.bold}┌─────────────────────────────────────────┐${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.white}${c.bold}Choose login method:${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.green}${c.bold}1)${c.r} ${c.white}Enter WhatsApp Number${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}│${c.r} ${c.yellow}${c.bold}2)${c.r} ${c.white}Paste Session ID${c.r} ${c.cyan}${c.bold}│${c.r}`)
    console.log(`${c.cyan}${c.bold}└─────────────────────────────────────────┘${c.r}`)
    console.log('')
  }

  const _envSession = (process.env.SESSION_ID || '').trim()
  if (_envSession && _envSession.length > 20) {
    console.log(`${c.green}[ ${_bn} ]${c.r} ${c.cyan}SESSION_ID found in .env — auto-logging in...${c.r}`)
    await handleSessionLogin(_envSession)
  }
  waitForConsoleInput()
}

//━━━━━━━━━━━━━━━━━━━━━━━━//
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Connection Bot - Multi-Session

async function connectSession(phone) {
  try {
    const sessionDir = path.join(SESSIONS_DIR, phone)
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })

    // Tear down old socket
    const existing = activeSessions.get(phone)
    if (existing) {
      try {
        await existing.end()
        await sleep(1000)
      } catch (e) {}
      activeSessions.delete(phone)
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    
    const sock = makeWASocket({
      version: [2, 3000, 1015901307],
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      },
      defaultQueryTimeoutMs: undefined,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 30000,
      connectTimeoutMs: 60000,
      retryRequestDelayMs: 250,
      maxMsgRetryCount: 5,
    })

    activeSessions.set(phone, sock)
    store.bind(sock.ev)

    // Connection handler
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update
      
      if (qr) {
        console.log(`${c.yellow}[ ${phone} ]${c.r} QR generated - use pairing code instead`)
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
          lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        
        console.log(`${c.red}[ ${phone} ]${c.r} Connection closed: ${lastDisconnect?.error?.message || 'unknown'}`)
        
        if (shouldReconnect) {
          console.log(`${c.yellow}[ ${phone} ]${c.r} Reconnecting...`)
          await sleep(5000)
          connectSession(phone)
        } else {
          console.log(`${c.red}[ ${phone} ]${c.r} Session logged out`)
          activeSessions.delete(phone)
        }
      } else if (connection === 'open') {
        console.log(`${c.green}${c.bold}[ ${phone} ]${c.r} ${c.green}BOT_CONNECTED${c.r}`)
        console.log(`${c.cyan}[ ${phone} ]${c.r} User: ${sock.user?.id || 'unknown'}`)
      }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0]
      if (!msg.key.fromMe && m.type === 'notify') {
        try {
          require('./client')(sock, msg)
        } catch (err) {
          console.error(`[ ${phone} ] Error handling message:`, err.message)
        }
      }
    })

  } catch (err) {
    console.error(`${c.red}[connectSession] Error:${c.r}`, err.message)
    activeSessions.delete(phone)
    setTimeout(() => connectSession(phone), 10000)
  }
}

// Start the bot
startBot()
