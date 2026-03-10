//═════════════════════════════════//

/*
🔗 UPGRADE IX MD Bot System
by Victonnel Victonnel • 2024 - 2026

>> Contact Links:
・WhatsApp : wa.me/254724504290
*/

//═════════════════════════════════//
 
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Module
require("./logger")   // ← Smart log suppressor (load FIRST)
require("./setting")
const { downloadContentFromMessage, proto, generateWAMessage, getContentType, prepareWAMessageMedia, generateWAMessageFromContent, GroupSettingChange, jidDecode, WAGroupMetadata, emitGroupParticipantsUpdate, emitGroupUpdate, generateMessageID, jidNormalizedUser, generateForwardMessageContent, WAGroupInviteMessageGroupMetadata, GroupMetadata, Headers, delay, WA_DEFAULT_EPHEMERAL, WADefault, getAggregateVotesInPollMessage, generateWAMessageContent, areJidsSameUser, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWaconnet, makeInMemoryStore, MediaType, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, initInMemoryKeyStore, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WAMediaUpload, mentionedJid, processTime, Browser, MessageType,
Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, DisconnectReason, WAconnet, getStream, WAProto, isBaileys, AnyMessageContent, templateMessage, InteractiveMessage, Header } = require("gifted-baileys")
const os = require('os')
const fs = require('fs')
const fg = require('api-dylux')
const fetch = require('node-fetch');
// Safe JSON fetch — never throws "not valid JSON", returns null on HTML/error responses
const safeJson = async (url, opts = {}) => {
    try {
        const r = await fetch(url, { ...opts, headers: { 'User-Agent': 'UPGRADE-IX-MD/2.0', ...(opts.headers || {}) } })
        const text = await r.text()
        if (text.trimStart().startsWith('<')) return null  // HTML response (404 page etc)
        return JSON.parse(text)
    } catch { return null }
}
// Patch fetch Response to never throw on HTML — returns null instead
const _origJson = require('node-fetch').Response.prototype.json
require('node-fetch').Response.prototype.json = async function() {
    const text = await this.text()
    if (text.trimStart().startsWith('<')) {
        console.warn('[API] HTML response received instead of JSON — API may be down')
        return null
    }
    try { return JSON.parse(text) } catch(e) {
        console.warn('[API] Invalid JSON response:', text.slice(0, 80))
        return null
    }
}

const util = require('util')
const axios = require('axios')
const { exec, execSync } = require("child_process")
const chalk = require('chalk')
const nou = require('node-os-utils')
const moment = require('moment-timezone');
const path = require ('path');
const didyoumean = require('didyoumean');
const similarity = require('similarity');
const speed = require('performance-now')
const { Sticker } = require('wa-sticker-formatter');
const { igdl } = require("btch-downloader");
const yts = require ('yt-search');
const FormData = require('form-data');
//> Scrape <//
const jktNews = require('./library/scrape/jktNews');
const otakuDesu = require('./library/scrape/otakudesu');
const Kusonime = require('./library/scrape/kusonime');
const { quote } = require('./library/scrape/quote.js');
const { fdown } = require('./library/scrape/facebook.js')

const {
        komiku,
        detail
} = require('./library/scrape/komiku');

const {
        wikimedia
} = require('./library/scrape/wikimedia');

const { 
        CatBox, 
        uploadImage
} = require('./library/scrape/uploader');

//━━━━━━━━━━━━━━━━━━━━━━━━//
// ChatBoAI core function — Anthropic API primary, Pollinations fallback
// Always responds in English regardless of input language
async function _runChatBoAI(userMsg, isAutoMode = false) {
    const _sys = isAutoMode
        ? `You are a friendly WhatsApp assistant. Always reply in English only, regardless of the language the user writes in. Keep replies short and conversational — 2 to 4 sentences max. Never use markdown formatting like ** or ##.`
        : `You are ChatBoAI, a smart and helpful assistant. Always reply in English only, no matter what language the user writes in. Be clear, accurate, and helpful. Avoid markdown formatting.`

    // 1. Anthropic Claude API (most reliable)
    try {
        const { default: fetch } = require('node-fetch')
        const _r1 = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY || '',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 500,
                system: _sys,
                messages: [{ role: 'user', content: userMsg }]
            }),
            signal: AbortSignal.timeout(15000)
        })
        const _d1 = await _r1.json()
        const _t1 = _d1?.content?.[0]?.text?.trim()
        if (_t1?.length > 2) return _t1
    } catch {}

    // 2. Pollinations OpenAI-compatible (free, no key needed)
    try {
        const axios = require('axios')
        const { data: _d2 } = await axios.post('https://text.pollinations.ai/openai', {
            model: 'openai',
            messages: [{ role: 'system', content: _sys }, { role: 'user', content: userMsg }],
            stream: false
        }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 })
        const _t2 = _d2?.choices?.[0]?.message?.content?.trim()
        if (_t2?.length > 2) return _t2
    } catch {}

    // 3. Pollinations GET fallback
    try {
        const axios = require('axios')
        const _p3 = encodeURIComponent(`${_sys}\n\nUser: ${userMsg}\n\nAssistant:`)
        const { data: _d3 } = await axios.get(`https://text.pollinations.ai/${_p3}`, { timeout: 12000, responseType: 'text' })
        if (_d3 && typeof _d3 === 'string' && _d3.trim().length > 2) return _d3.trim()
    } catch {}

    throw new Error('All AI services unavailable')
}

module.exports = async (X, m) => {
try {
const from = m.key.remoteJid
var body = (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.text) : ""
body = body || ""
//━━━━━━━━━━━━━━━━━━━━━━━━//
// library
const { smsg, fetchJson, getBuffer, fetchBuffer, getGroupAdmins, TelegraPh, isUrl, hitungmundur, sleep, clockString, checkBandwidth, runtime, tanggal, getRandom } = require('./library/lib/myfunc')

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Main Setting (Admin And Prefix ) 
const budy = (typeof m.text === 'string') ? m.text : '';
const mess = global.mess || {};
const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
const prefix = global.botPrefix ? global.botPrefix : (prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.');
const isCmd = global.botPrefix ? body.startsWith(global.botPrefix) : body.startsWith(prefix);
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = body.trim().split(/ +/).slice(1)
const text = q = args.join(" ")
const sender = m.key.fromMe ? (X.user.id.split(':')[0]+'@s.whatsapp.net' || X.user.id) : (m.key.participant || m.key.remoteJid)
const botNumber = await X.decodeJid(X.user.id)
const senderNumber = sender.split('@')[0].split(':')[0]
const botNum = botNumber.split('@')[0].split(':')[0]
const ownerNums = [...global.owner].map(v => v.replace(/[^0-9]/g, ''))

const botJid = X.decodeJid(X.user.id)
let botLidRaw = X.user?.lid || null
if (!botLidRaw) {
    try {
        const _fs = require('fs')
        const _path = require('path')
        const phoneNum = (X.user.id || '').split(':')[0].split('@')[0]
        const credsPaths = [
            _path.join(__dirname, 'sessions', phoneNum, 'creds.json'),
            _path.join(__dirname, 'sessions', 'creds.json'),
            _path.join(__dirname, 'auth_info_baileys', 'creds.json'),
            _path.join(__dirname, '..', 'sessions', phoneNum, 'creds.json'),
            _path.join(__dirname, '..', 'sessions', 'creds.json'),
            _path.join(__dirname, '..', 'auth_info_baileys', 'creds.json'),
        ]
        for (const cp of credsPaths) {
            if (_fs.existsSync(cp)) {
                const creds = JSON.parse(_fs.readFileSync(cp, 'utf-8'))
                if (creds?.me?.lid) {
                    botLidRaw = creds.me.lid
                    X.user.lid = botLidRaw
                    break
                }
            }
        }
    } catch (e) {}
}
const botLid = botLidRaw ? X.decodeJid(botLidRaw) : null

const senderJid = m.sender || sender
const senderFromKey = m.key?.participant ? X.decodeJid(m.key.participant) : null

function isSameUser(participantId, targetId) {
    if (!participantId || !targetId) return false
    try { return areJidsSameUser(participantId, targetId) } catch { }
    const pUser = participantId.split(':')[0].split('@')[0]
    const tUser = targetId.split(':')[0].split('@')[0]
    return pUser === tUser
}

function isParticipantBot(p) {
    if (!p || !p.id) return false
    if (isSameUser(p.id, X.user.id)) return true
    if (X.user?.lid && isSameUser(p.id, X.user.lid)) return true
    if (isSameUser(p.id, botJid)) return true
    if (botLid && isSameUser(p.id, botLid)) return true
    return false
}

function isParticipantSender(p) {
    if (!p || !p.id) return false
    if (isSameUser(p.id, senderJid)) return true
    if (senderFromKey && isSameUser(p.id, senderFromKey)) return true
    if (m.sender && isSameUser(p.id, m.sender)) return true
    if (m.key?.participant && isSameUser(p.id, m.key.participant)) return true
    if (sender && isSameUser(p.id, sender)) return true
    return false
}

const senderClean = senderJid.split(':')[0].split('@')[0]
const senderKeyClean = senderFromKey ? senderFromKey.split(':')[0].split('@')[0] : null
const botClean = botJid.split(':')[0].split('@')[0]

const isOwner = (
    m.key.fromMe ||
    senderClean === botClean ||
    ownerNums.includes(senderClean) ||
    (senderKeyClean && (senderKeyClean === botClean || ownerNums.includes(senderKeyClean)))
) || false

const isGroup = m.isGroup
const pushname = m.pushName || `${senderNumber}`
const isBot = botNumber.includes(senderNumber)
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const groupMetadata = isGroup ? await X.groupMetadata(from).catch(e => null) : null
const groupName = isGroup && groupMetadata ? groupMetadata.subject || '' : ''
const participants = isGroup && groupMetadata ? groupMetadata.participants || [] : []
const groupAdmins = isGroup && participants.length ? await getGroupAdmins(participants) : []

const isBotAdmins = isGroup && participants.length ? participants.some(p => {
    return isParticipantBot(p) && (p.admin === 'admin' || p.admin === 'superadmin')
}) : false

const isAdmins = isGroup ? (isOwner || (participants.length ? participants.some(p => {
    return isParticipantSender(p) && (p.admin === 'admin' || p.admin === 'superadmin')
}) : false)) : false

const isSuperAdmin = isGroup && participants.length ? participants.some(p => {
    return isParticipantSender(p) && p.admin === 'superadmin'
}) : false
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Setting Console
if (m.message) {
    const _mtype = Object.keys(m.message)[0] || 'unknown'
    // Skip noisy protocol/system messages — only log real user content
    const _skipTypes = ['protocolMessage','senderKeyDistributionMessage','messageContextInfo','ephemeralMessage']
    if (!_skipTypes.includes(_mtype)) {
        const _time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const _date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        const _body = budy || (m.mtype ? m.mtype.replace('Message','') : _mtype.replace('Message',''))
        const _preview = _body.length > 60 ? _body.slice(0, 60) + '\u2026' : _body
        const _chatLabel = m.isGroup
            ? 'Group   ' + chalk.cyan(pushname) + chalk.dim(' [' + from.split('@')[0] + ']')
            : 'Private ' + chalk.cyan(pushname) + chalk.dim(' [' + m.sender.split('@')[0] + ']')
        const _icon = m.isGroup ? '\uD83D\uDC65' : '\uD83D\uDCAC'
        const _typeIcons = {imageMessage:'\uD83D\uDDBC\uFE0F ',videoMessage:'\uD83C\uDFA5 ',audioMessage:'\uD83C\uDFB5 ',stickerMessage:'\uD83C\uDF00 ',documentMessage:'\uD83D\uDCC4 ',locationMessage:'\uD83D\uDCCD ',contactMessage:'\uD83D\uDC64 '}
        const _tIcon = _typeIcons[_mtype] || ''
        console.log(
            '\n' +
            chalk.bgCyan(chalk.black(' MSG ')) + ' ' + chalk.dim(_date) + ' ' + chalk.bold(_time) + '\n' +
            chalk.dim('  \u251C ') + chalk.yellow('From    ') + chalk.green(pushname) + chalk.dim(' (' + m.sender.split('@')[0] + ')') + '\n' +
            chalk.dim('  \u251C ') + chalk.yellow(_icon + ' Chat    ') + _chatLabel + '\n' +
            chalk.dim('  \u2514 ') + chalk.yellow('\uD83D\uDCAC Text    ') + chalk.white(_tIcon + _preview)
        )
    }
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Auto Fake Presence (typing/recording/online)
if (global.fakePresence && global.fakePresence !== 'off' && !m.key.fromMe) {
    try {
        if (global.fakePresence === 'typing') {
            await X.sendPresenceUpdate('composing', from)
        } else if (global.fakePresence === 'recording') {
            await X.sendPresenceUpdate('recording', from)
        } else if (global.fakePresence === 'online') {
            await X.sendPresenceUpdate('available')
        }
    } catch(e) {}
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Reply / Reply Message
const reply = (teks) => { 
X.sendMessage(from, { text: teks, contextInfo: { 
"externalAdReply": { 
"showAdAttribution": true, 
"title": "UPGRADE IX MD", 
"containsAutoReply": true, 
"mediaType": 1, 
"thumbnail": fakethmb, 
"mediaUrl": "https://wa.me/254724504290", 
"sourceUrl": "https://wa.me/254724504290" }}}, { quoted: m }) }

const reply2 = (teks) => {
X.sendMessage(from, { text : teks }, { quoted : m })
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Function Area
try {
ppuser = await X.profilePictureUrl(m.sender, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
ppnyauser = await getBuffer(ppuser)

const reSize = async(buffer, ukur1, ukur2) => {
   return new Promise(async(resolve, reject) => {
      let jimp = require('jimp')
      var baper = await jimp.read(buffer);
      var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
      resolve(ab)
   })
}
    const fakethmb = await reSize(ppuser, 300, 300)
    // function resize
    let jimp = require("jimp")
const resize = async (image, width, height) => {
    const read = await jimp.read(image);
    const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
    return data;
};

const safeSendMedia = async (jid, mediaObj, options = {}, sendOpts = {}) => {
    try {
        for (const key of ['image', 'video', 'audio', 'document', 'sticker']) {
            if (mediaObj[key]) {
                const val = mediaObj[key];
                if (val && typeof val === 'object' && val.url) {
                    if (!val.url || val.url === 'undefined' || val.url === 'null' || val.url === undefined) {
                        return reply('Media URL is not available. The source may be down.');
                    }
                } else if (val === undefined || val === null) {
                    return reply('Media data is not available. Please try again later.');
                }
            }
        }
        await X.sendMessage(jid, mediaObj, sendOpts);
    } catch (err) {
        console.error('Safe media send error:', err.message);
        reply('Failed to send media: ' + (err.message || 'Unknown error'));
    }
};

const userDbPath = './database/users.json';
function loadUsers() {
    try {
        if (!fs.existsSync(userDbPath)) return {};
        return JSON.parse(fs.readFileSync(userDbPath));
    } catch { return {}; }
}
function saveUsers(data) {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true });
    fs.writeFileSync(userDbPath, JSON.stringify(data, null, 2));
}
function trackUser(senderJid, name, cmd) {
    let users = loadUsers();
    const now = new Date().toISOString();
    if (!users[senderJid]) {
        users[senderJid] = { name: name, firstSeen: now, lastSeen: now, commandCount: 0, commands: {} };
    }
    users[senderJid].name = name;
    users[senderJid].lastSeen = now;
    users[senderJid].commandCount = (users[senderJid].commandCount || 0) + 1;
    if (cmd) {
        users[senderJid].commands[cmd] = (users[senderJid].commands[cmd] || 0) + 1;
    }
    saveUsers(users);
}

if (isCmd && command) {
    trackUser(sender, pushname, command);
    if (!isOwner && !isBot) {
        const userData = loadUsers();
        if (userData[sender]?.banned) {
            return reply('You have been banned from using this bot. Contact the admin for assistance.');
        }
    }
}

if (global.pmBlocker && !m.isGroup && !isOwner && !isBot && !m.key.fromMe) {
    return
}

if (global.autoReact && m.key && !m.key.fromMe) {
    try { await X.sendMessage(m.chat, { react: { text: global.autoReactEmoji || '👍', key: m.key } }) } catch {}
}

if (m.isGroup && !isAdmins && !isOwner) {
    if (global.antiBadword && budy) {
        let badwords = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'nigga', 'nigger']
        let hasBadword = badwords.some(w => budy.toLowerCase().includes(w))
        if (hasBadword && isBotAdmins) {
            await X.sendMessage(m.chat, { delete: m.key })
            await X.sendMessage(from, { text: `@${sender.split('@')[0]} watch your language! Badword detected.`, mentions: [sender] })
        }
    }
    if (global.antiTag && m.mentionedJid && m.mentionedJid.length > 5 && isBotAdmins) {
        await X.sendMessage(m.chat, { delete: m.key })
        await X.sendMessage(from, { text: `@${sender.split('@')[0]} mass tagging is not allowed!`, mentions: [sender] })
        return
    }
    if (global.antiSticker && m.mtype === 'stickerMessage' && isBotAdmins) {
        await X.sendMessage(m.chat, { delete: m.key })
        return
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Leaderboard Games
const leaderboardPath = './database/leaderboard.json';

// Load leaderboard
function loadLeaderboard() {
  if (!fs.existsSync(leaderboardPath)) return {};
  return JSON.parse(fs.readFileSync(leaderboardPath));
}

// Save leaderboard
function saveLeaderboard(data) {
  fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 2));
}

// Note: The rest of your game code continues here...
// The file appears to be cut off. Would you like me to add the complete game logic?
