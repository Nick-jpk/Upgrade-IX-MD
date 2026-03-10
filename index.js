//═════════════════════════════════//

/*
🔗 UPGRADE IX MD Bot System - MULTI-PLATFORM EDITION
by Victonnel Victonnel • 2024 - 2026
Now with WhatsApp + Discord Support!

>> Contact Links:
・WhatsApp : wa.me/254724504290
・Discord : coming soon
*/

//═════════════════════════════════//
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Module
require("./logger")   // ← Smart log suppressor (load FIRST)
// Load .env before anything else so SESSION_ID is available
try { require("dotenv").config() } catch {} // dotenv optional — manual login still works
require("./setting")
const { default: makeWASocket, DisconnectReason, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage, areJidsSameUser } = require("gifted-baileys")
const { makeInMemoryStore } = require('./library/lib/store')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const readline = require("readline");
const _ = require('lodash')
const yargs = require('yargs/yargs')
const PhoneNumber = require('awesome-phonenumber')
const FileType = require('file-type')
const path = require('path')
const fetch = require("node-fetch") 
const { getBuffer } = require('./library/lib/myfunc')
const { imageToWebp, imageToWebp3, videoToWebp, writeExifImg, writeExifImgAV, writeExifVid } = require('./library/lib/exif')

// ========== DISCORD INTEGRATION ==========
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
// =========================================

const c = {
    r: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    white: '\x1b[37m',
    bgGreen: '\x1b[42m',
    bgCyan: '\x1b[46m',
    bgYellow: '\x1b[43m',
    bgRed: '\x1b[41m',
    bgMagenta: '\x1b[45m',
    bgBlue: '\x1b[44m',
}

process.on('uncaughtException', (err) => {
    let em = (err?.message || String(err)).toLowerCase()
    let es = (err?.stack || '').toLowerCase()
    let isSignal = (
        em.includes('no sessions') || em.includes('sessionerror') ||
        em.includes('bad mac') || em.includes('failed to decrypt') ||
        em.includes('no senderkey') || em.includes('invalid prekey') ||
        em.includes('invalid message') || em.includes('nosuchsession') ||
        es.includes('session_cipher') || es.includes('libsignal') || es.includes('queue_job')
    )
    if (isSignal) {
        console.log('[Suppressed-UncaughtException] Signal noise:', err.message || err)
    } else {
        console.error('[UncaughtException]', err.message || err)
    }
})
process.on('unhandledRejection', (err) => {
    let em = (err?.message || String(err)).toLowerCase()
    let es = (err?.stack || '').toLowerCase()
    let isSignal = (
        em.includes('no sessions') || em.includes('sessionerror') ||
        em.includes('bad mac') || em.includes('failed to decrypt') ||
        em.includes('no senderkey') || em.includes('invalid prekey') ||
        em.includes('invalid message') || em.includes('nosuchsession') ||
        es.includes('session_cipher') || es.includes('libsignal') || es.includes('queue_job')
    )
    if (isSignal) {
        console.log('[Suppressed-UnhandledRejection] Signal noise:', err?.message || err)
    } else {
        console.error('[UnhandledRejection]', err?.message || err)
    }
})

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Anti-Tampering Protection
const _ov = '254748340864'
const _bn = 'UPGRADE IX MD'
const _ba = 'Toosii Tech'
function _integrityCheck() {
    const ownerValid = global.owner && global.owner.includes(_ov)
    const nameValid = global.botname && global.botname.includes('UPGRADE')
    const authorValid = global.ownername === _ba
    if (!ownerValid || !nameValid || !authorValid) {
        console.log('\n╔══════════════════════════════════════════╗')
        console.log('║  ⚠️  INTEGRITY CHECK FAILED               ║')
        console.log('║  Unauthorized modification detected.      ║')
        console.log('║  This bot is property of Toosii Tech.     ║')
        console.log('║  Restore original settings to continue.   ║')
        console.log('║  Contact: wa.me/254748340864               ║')
        console.log('╚══════════════════════════════════════════╝\n')
        process.exit(1)
    }
    global.owner = [...new Set([_ov, ...global.owner])]
    global._protectedOwner = _ov
    global._protectedBrand = _bn
    global._protectedAuthor = _ba
}
_integrityCheck()
setInterval(_integrityCheck, 300000)

//━━━━━━━━━━━━━━━━━━━━━━━━//
// ========== SHARED COMMAND HANDLER ==========
// This will store commands that work on both platforms
const sharedCommands = new Collection();

// Load shared commands
function loadSharedCommands() {
    const commandsPath = path.join(__dirname, 'shared_commands');
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        // Create a sample command
        const sampleCommand = `module.exports = {
    name: 'ping',
    description: 'Check bot response time',
    async executeWhatsApp(sock, message, args) {
        const start = Date.now();
        await sock.sendMessage(message.key.remoteJid, { text: '🏓 Pong!' });
        const end = Date.now();
        await sock.sendMessage(message.key.remoteJid, { text: \`Response time: \${end - start}ms\` });
    },
    async executeDiscord(message, args, client) {
        const start = Date.now();
        const msg = await message.reply('🏓 Pong!');
        const end = Date.now();
        await msg.edit(\`🏓 Pong! Response time: \${end - start}ms\`);
    }
};`;
        fs.writeFileSync(path.join(commandsPath, 'ping.js'), sampleCommand);
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('name' in command && ('executeWhatsApp' in command || 'executeDiscord' in command)) {
            sharedCommands.set(command.name, command);
            console.log(`${c.green}[ SHARED ]${c.r} Loaded command: ${command.name}`);
        }
    }
}
// ============================================

// ========== DISCORD BOT SETUP ==========
let discordClient = null;
const discordCommands = new Collection();

async function startDiscordBot() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        console.log(`${c.yellow}[ DISCORD ]${c.r} No Discord token found. Skipping Discord bot.`);
        return;
    }

    discordClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ]
    });

    discordClient.commands = new Collection();

    // Load Discord-specific commands
    const discordCommandsPath = path.join(__dirname, 'discord_commands');
    if (fs.existsSync(discordCommandsPath)) {
        const commandFiles = fs.readdirSync(discordCommandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(discordCommandsPath, file));
            if ('name' in command && 'execute' in command) {
                discordClient.commands.set(command.name, command);
                console.log(`${c.blue}[ DISCORD ]${c.r} Loaded command: ${command.name}`);
            }
        }
    }

    discordClient.once(Events.ClientReady, () => {
        console.log(`${c.blue}${c.bold}╔══════════════════════════════════════════╗${c.r}`);
        console.log(`${c.blue}${c.bold}║${c.r}  ${c.green}${c.bold}✅ DISCORD BOT CONNECTED${c.r}                ${c.blue}${c.bold}║${c.r}`);
        console.log(`${c.blue}${c.bold}║${c.r}  ${c.white}Logged in as: ${c.cyan}${discordClient.user.tag}${c.r}        ${c.blue}${c.bold}║${c.r}`);
        console.log(`${c.blue}${c.bold}╚══════════════════════════════════════════╝${c.r}`);
    });

    discordClient.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        const prefix = process.env.DISCORD_PREFIX || '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Check Discord-specific commands first
        const discordCommand = discordClient.commands.get(commandName);
        if (discordCommand) {
            try {
                await discordCommand.execute(message, args, discordClient);
            } catch (error) {
                console.error(error);
                await message.reply('There was an error executing that command!');
            }
            return;
        }

        // Check shared commands
        const sharedCommand = sharedCommands.get(commandName);
        if (sharedCommand && sharedCommand.executeDiscord) {
            try {
                await sharedCommand.executeDiscord(message, args, discordClient);
            } catch (error) {
                console.error(error);
                await message.reply('There was an error executing that command!');
            }
        }
    });

    try {
        await discordClient.login(token);
    } catch (error) {
        console.log(`${c.red}[ DISCORD ]${c.r} Failed to login: ${error.message}`);
    }
}
// ========================================

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Session & State
const SESSIONS_DIR = path.join(__dirname, 'sessions')
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true })

const activeSessions = new Map()
const processedMsgs = new Set()
const msgRetryCache = new Map()

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Console Login Interface

async function handleSessionLogin(sessionId) {
    if (!sessionId || sessionId.length < 10) {
        console.log(`[ ${_bn} ] Invalid Session ID. Too short.`)
        return
    }
    try {
        console.log(`[ ${_bn} ] Processing Session ID...`)

        // Strip any known prefix (e.g. "UPGRADE~", "Gifted~", etc.) before decoding
        let rawId = sessionId
        const prefixMatch = rawId.match(/^[A-Za-z0-9_\-]+~/)
        if (prefixMatch) {
            rawId = rawId.slice(prefixMatch[0].length)
            console.log(`[ ${_bn} ] Stripped prefix: ${prefixMatch[0]}`)
        }

        let credsData
        const zlib = require('zlib')
        const decodedBuf = (() => { try { return Buffer.from(rawId, 'base64') } catch { return null } })()

        if (decodedBuf) {
            // Try gzip decompression first (Gifted-style session)
            let parsed = false
            try {
                const decompressed = zlib.gunzipSync(decodedBuf).toString('utf-8')
                credsData = JSON.parse(decompressed)
                parsed = true
                console.log(`[ ${_bn} ] Decoded as gzip-compressed session`)
            } catch {}

            // Try plain base64 JSON (UPGRADE-style session)
            if (!parsed) {
                try {
                    credsData = JSON.parse(decodedBuf.toString('utf-8'))
                    parsed = true
                    console.log(`[ ${_bn} ] Decoded as plain base64 session`)
                } catch {}
            }

            // Try raw JSON string (no encoding)
            if (!parsed) {
                try {
                    credsData = JSON.parse(rawId)
                    parsed = true
                    console.log(`[ ${_bn} ] Decoded as raw JSON session`)
                } catch {}
            }

            if (!parsed) {
                console.log(`[ ${_bn} ] Invalid Session ID format. Must be base64 encoded or JSON.`)
                return
            }
        } else {
            // Buffer.from failed — try raw JSON
            try {
                credsData = JSON.parse(rawId)
                console.log(`[ ${_bn} ] Decoded as raw JSON session`)
            } catch {
                console.log(`[ ${_bn} ] Invalid Session ID format. Must be base64 encoded or JSON.`)
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
            console.log(`${c.green}[ ${_bn} ]${c.r} ${c.dim}Example: ${c.cyan}254748340864${c.r} ${c.dim}(Kenya), ${c.cyan}2348012345678${c.r} ${c.dim}(Nigeria), ${c.cyan}12025551234${c.r} ${c.dim}(US)${c.r}`)
            console.log(`${c.green}[ ${_bn} ]${c.r} ${c.red}Do NOT include + or leading 0${c.r}`)
            console.log('')
            rl.once('line', async (phoneInput) => {
                const phone = phoneInput.trim().replace(/[^0-9]/g, '')
                if (phone.length < 10 || phone.length > 15) {
                    console.log(`${c.red}[ ${_bn} ] ✗ Invalid number. Must be 10-15 digits with country code.${c.r}`)
                    waitForConsoleInput()
                    return
                }
                if (phone.startsWith('0')) {
                    console.log(`${c.red}[ ${_bn} ] ✗ Do not start with 0. Use country code instead.${c.r}`)
                    waitForConsoleInput()
                    return
                }
                console.log(`${c.green}[ ${_bn} ]${c.r} ${c.cyan}Connecting with number: ${c.bold}${phone}${c.r}${c.cyan}...${c.r}`)
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
            console.log(`${c.green}[ ${_bn} ]${c.r} ${c.dim}Skipped. Bot is running with existing sessions.${c.r}`)
            waitForConsoleInput()
        } else if (cmd.length >= 10 && /^[0-9]+$/.test(cmd)) {
            console.log(`${c.green}[ ${_bn} ]${c.r} Detected phone number: ${c.cyan}${c.bold}${cmd}${c.r}`)
            console.log(`${c.green}[ ${_bn} ]${c.r} ${c.cyan}Connecting...${c.r}`)
            await connectSession(cmd)
            waitForConsoleInput()
        } else if (cmd) {
            console.log(`${c.red}[ ${_bn} ] ✗ Unknown command: "${cmd}"${c.r}`)
            console.log(`${c.yellow}[ ${_bn} ]${c.r} Type ${c.green}${c.bold}1${c.r} for Pairing Code, ${c.yellow}${c.bold}2${c.r} for Session ID`)
            waitForConsoleInput()
        } else {
            waitForConsoleInput()
        }
    })
}

async function startBot() {
    console.log('')
    console.log(`${c.cyan}${c.bold}╔══════════════════════════════════════════╗${c.r}`)
    console.log(`${c.cyan}${c.bold}║${c.r}  ${c.green}${c.bold}⚡ UPGRADE IX MD${c.r} ${c.yellow}v2.0.0${c.r}               ${c.cyan}${c.bold}║${c.r}`)
    console.log(`${c.cyan}${c.bold}║${c.r}  ${c.white}${c.bold}   WhatsApp + Discord Multi-Platform${c.r}     ${c.cyan}${c.bold}║${c.r}`)
    console.log(`${c.cyan}${c.bold}║${c.r}  ${c.magenta}     by Toosii Tech © 2024-2026${c.r}     ${c.cyan}${c.bold}║${c.r}`)
    console.log(`${c.cyan}${c.bold}╚══════════════════════════════════════════╝${c.r}`)
    console.log('')

    // Load shared commands
    loadSharedCommands();

    // Start Discord bot
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
        console.log(`${c.green}[ ${_bn} ]${c.r} Found ${c.yellow}${c.bold}${existingSessions.length}${c.r} existing session(s): ${c.cyan}${existingSessions.join(', ')}${c.r}`)
        console.log(`${c.green}[ ${_bn} ]${c.r} ${c.dim}Reconnecting existing sessions...${c.r}`)
        console.log('')
        for (const phone of existingSessions) {
            connectSession(phone)
        }
        console.log('')
        console.log(`${c.cyan}${c.bold}┌─────────────────────────────────────────┐${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.white}${c.bold}Choose login method:${c.r}                    ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}                                         ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.green}${c.bold}1)${c.r} ${c.white}Enter WhatsApp Number${c.r} ${c.dim}(Pairing Code)${c.r} ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.yellow}${c.bold}2)${c.r} ${c.white}Paste Session ID${c.r}                     ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.magenta}${c.bold}3)${c.r} ${c.white}Skip${c.r} ${c.dim}(already connected)${c.r}            ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}└─────────────────────────────────────────┘${c.r}`)
        console.log('')
    } else {
        console.log(`${c.yellow}[ ${_bn} ]${c.r} ${c.dim}No existing sessions found.${c.r}`)
        console.log('')
        console.log(`${c.cyan}${c.bold}┌─────────────────────────────────────────┐${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.white}${c.bold}Choose login method:${c.r}                    ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}                                         ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.green}${c.bold}1)${c.r} ${c.white}Enter WhatsApp Number${c.r} ${c.dim}(Pairing Code)${c.r} ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}│${c.r}  ${c.yellow}${c.bold}2)${c.r} ${c.white}Paste Session ID${c.r}                     ${c.cyan}${c.bold}│${c.r}`)
        console.log(`${c.cyan}${c.bold}└─────────────────────────────────────────┘${c.r}`)
        console.log('')
    }

    // ── Auto-login from .env SESSION_ID ─────────────────────────────────────
    const _envSession = (process.env.SESSION_ID || '').trim()
    if (_envSession && _envSession.length > 20) {
        console.log(`${c.green}[ ${_bn} ]${c.r} ${c.cyan}SESSION_ID found in .env — auto-logging in...${c.r}`)
        console.log('')
        await handleSessionLogin(_envSession)
        waitForConsoleInput()
    } else {
        waitForConsoleInput()
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━//
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Connection Bot - Multi-Session

async function connectSession(phone) {
try {
const sessionDir = path.join(SESSIONS_DIR, phone)
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })

// ── Tear down the old socket before creating a ne
