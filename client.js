//═══════════════════════════════════════════════════════════════//
//                                                               //
//   🔗 UPGRADE IX MD - Message Handler                         //
//   by Victonnel • 2024 - 2026                                  //
//═══════════════════════════════════════════════════════════════//

require("./logger")
require("./setting")

const { 
  downloadContentFromMessage, 
  proto, 
  generateWAMessage, 
  getContentType, 
  prepareWAMessageMedia, 
  generateWAMessageFromContent, 
  jidDecode, 
  generateMessageID, 
  jidNormalizedUser, 
  generateForwardMessageContent, 
  areJidsSameUser, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore, 
  makeInMemoryStore, 
  downloadAndSaveMediaMessage, 
  useSingleFileAuthState, 
  BufferJSON, 
  WAMessageProto, 
  MessageOptions, 
  WAContextInfo, 
  waChatKey, 
  MimetypeMap, 
  MediaPathMap, 
  WAContactMessage, 
  WAContactsArrayMessage, 
  WATextMessage, 
  WAMessageContent, 
  WAMessage, 
  BaileysError, 
  WA_MESSAGE_STATUS_TYPE, 
  MediaConnInfo, 
  URL_REGEX, 
  WAUrlInfo, 
  WAMediaUpload, 
  mentionedJid, 
  processTime, 
  Browser, 
  MessageType,
  Presence, 
  WA_MESSAGE_STUB_TYPES, 
  Mimetype, 
  relayWAMessage, 
  Browsers, 
  DisconnectReason, 
  getStream, 
  WAProto, 
  isBaileys, 
  AnyMessageContent, 
  templateMessage, 
  InteractiveMessage, 
  Header 
} = require("gifted-baileys")

const os = require('os')
const fs = require('fs')
const fg = require('api-dylux')
const fetch = require('node-fetch')
const util = require('util')
const axios = require('axios')
const { exec, execSync } = require("child_process")
const chalk = require('chalk')
const nou = require('node-os-utils')
const moment = require('moment-timezone')
const path = require('path')
const didyoumean = require('didyoumean')
const similarity = require('similarity')
const speed = require('performance-now')
const { Sticker } = require('wa-sticker-formatter')
const { igdl } = require("btch-downloader")
const yts = require('yt-search')
const FormData = require('form-data')

// Safe JSON fetch
const safeJson = async (url, opts = {}) => {
  try {
    const r = await fetch(url, { 
      ...opts, 
      headers: { 
        'User-Agent': 'UPGRADE-IX-MD/2.0', 
        ...(opts.headers || {}) 
      } 
    })
    const text = await r.text()
    if (text.trimStart().startsWith('<')) return null
    return JSON.parse(text)
  } catch { 
    return null 
  }
}

// Patch fetch Response
const _origJson = require('node-fetch').Response.prototype.json
require('node-fetch').Response.prototype.json = async function() {
  const text = await this.text()
  if (text.trimStart().startsWith('<')) {
    console.warn('[API] HTML response received instead of JSON')
    return null
  }
  try { 
    return JSON.parse(text) 
  } catch(e) {
    console.warn('[API] Invalid JSON response:', text.slice(0, 80))
    return null
  }
}

// AI Chat Function
const chatBotAI = async (userMsg, context = '') => {
  const _sys = context || 'You are UPGRADE IX MD, a powerful WhatsApp bot by Victonnel Victonnel.'
  
  try {
    const _p1 = encodeURIComponent(`${_sys}\\n\\nUser: ${userMsg}\\n\\nAssistant:`)
    const { data: _d1 } = await axios.get(`https://text.pollinations.ai/${_p1}`, { 
      timeout: 15000, 
      responseType: 'text' 
    })
    if (_d1 && typeof _d1 === 'string' && _d1.trim().length > 2) return _d1.trim()
  } catch {}

  try {
    const { data: _d2 } = await axios.post('https://text.pollinations.ai/openai', {
      model: 'openai',
      messages: [{ role: 'system', content: _sys }, { role: 'user', content: userMsg }],
      stream: false
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 })
    const _t2 = _d2?.choices?.[0]?.message?.content?.trim()
    if (_t2?.length > 2) return _t2
  } catch {}

  try {
    const _p3 = encodeURIComponent(`${_sys}\\n\\nUser: ${userMsg}\\n\\nAssistant:`)
    const { data: _d3 } = await axios.get(`https://text.pollinations.ai/${_p3}`, { 
      timeout: 12000, 
      responseType: 'text' 
    })
    if (_d3 && typeof _d3 === 'string' && _d3.trim().length > 2) return _d3.trim()
  } catch {}

  throw new Error('All AI services unavailable')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// Main Handler
module.exports = async (X, m) => {
  try {
    const from = m.key.remoteJid
    
    // Extract message body
    var body = (m.mtype === 'interactiveResponseMessage') 
      ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id 
      : (m.mtype === 'conversation') ? m.message.conversation 
      : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption 
      : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption 
      : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text 
      : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId 
      : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId 
      : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId 
      : (m.mtype == 'messageContextInfo') 
        ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.text) 
      : ""
    
    body = body || ""

    // Load library functions
    const { 
      smsg, 
      fetchJson, 
      getBuffer, 
      fetchBuffer, 
      getGroupAdmins, 
      TelegraPh, 
      isUrl, 
      hitungmundur, 
      sleep, 
      clockString, 
      checkBandwidth, 
      runtime, 
      tanggal, 
      getRandom 
    } = require('./library/lib/myfunc')

    // Settings
    const budy = (typeof m.text === 'string') ? m.text : ''
    const mess = global.mess || {}
    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><\\`™©®Δ^βα~¦|/\\\\©^]/
    const prefix = global.botPrefix ? global.botPrefix : (prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.')
    const isCmd = global.botPrefix ? body.startsWith(global.botPrefix) : body.startsWith(prefix)
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
    const args = body.trim().split(/ +/).slice(1)
    const text = q = args.join(" ")
    const sender = m.key.fromMe 
      ? (X.user.id.split(':')[0]+'@s.whatsapp.net' || X.user.id) 
      : (m.key.participant || m.key.remoteJid)
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

    // Helper functions
    function isSameUser(participantId, targetId) {
      if (!participantId || !targetId) return false
      try { 
        return areJidsSameUser(participantId, targetId) 
      } catch { }
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

    const isBotAdmins = isGroup && participants.length 
      ? participants.some(p => isParticipantBot(p) && (p.admin === 'admin' || p.admin === 'superadmin'))
      : false

    const isAdmins = isGroup 
      ? (isOwner || (participants.length ? participants.some(p => {
          return isParticipantSender(p) && (p.admin === 'admin' || p.admin === 'superadmin')
        }) : false))
      : false

    const isSuperAdmin = isGroup && participants.length 
      ? participants.some(p => isParticipantSender(p) && p.admin === 'superadmin')
      : false

    // Console logging
    if (m.message) {
      const _mtype = Object.keys(m.message)[0] || 'unknown'
      const _skipTypes = ['protocolMessage','senderKeyDistributionMessage','messageContextInfo','ephemeralMessage']
      
      if (!_skipTypes.includes(_mtype)) {
        const _time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const _date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        const _body = budy || (m.mtype ? m.mtype.replace('Message','') : _mtype.replace('Message',''))
        const _preview = _body.length > 60 ? _body.slice(0, 60) + '\\u2026' : _body
        const _chatLabel = m.isGroup
          ? 'Group ' + chalk.cyan(pushname) + chalk.dim(' [' + from.split('@')[0] + ']')
          : 'Private ' + chalk.cyan(pushname) + chalk.dim(' [' + m.sender.split('@')[0] + ']')
        const _icon = m.isGroup ? '\\uD83D\\uDC65' : '\\uD83D\\uDCAC'
        const _typeIcons = {
          imageMessage:'\\uD83D\\uDDBC\\uFE0F ',
          videoMessage:'\\uD83C\\uDFA5 ',
          audioMessage:'\\uD83C\\uDFB5 ',
          stickerMessage:'\\uD83C\\uDF00 ',
          documentMessage:'\\uD83D\\uDCC4 ',
          locationMessage:'\\uD83D\\uDCCD ',
          contactMessage:'\\uD83D\\uDC64 '
        }
        const _tIcon = _typeIcons[_mtype] || ''
        
        console.log(
          '\\n' +
          chalk.bgCyan(chalk.black(' MSG ')) + ' ' + chalk.dim(_date) + ' ' + chalk.bold(_time) + '\\n' +
          chalk.dim(' \\u251C ') + chalk.yellow('From ') + chalk.green(pushname) + chalk.dim(' (' + m.sender.split('@')[0] + ')') + '\\n' +
          chalk.dim(' \\u251C ') + chalk.yellow(_icon + ' Chat ') + _chatLabel + '\\n' +
          chalk.dim(' \\u2514 ') + chalk.yellow('\\uD83D\\uDCAC Text ') + chalk.white(_tIcon + _preview)
        )
      }
    }

    // Auto presence
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

    // Profile picture
    let ppuser
    try {
      ppuser = await X.profilePictureUrl(m.sender, 'image')
    } catch (err) {
      ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
    }
    
    const ppnyauser = await getBuffer(ppuser)

    // Resize function
    const reSize = async(buffer, ukur1, ukur2) => {
      return new Promise(async(resolve, reject) => {
        let jimp = require('jimp')
        var baper = await jimp.read(buffer)
        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
        resolve(ab)
      })
    }

    const fakethmb = await reSize(ppuser, 300, 300)

    // Reply functions
    const reply = (teks) => {
      X.sendMessage(from, { 
        text: teks, 
        contextInfo: {
          "externalAdReply": {
            "showAdAttribution": true,
            "title": global.botname || "UPGRADE IX MD",
            "containsAutoReply": true,
            "mediaType": 1,
            "thumbnail": fakethmb,
            "mediaUrl": "https://wa.me/254724504290",
            "sourceUrl": "https://wa.me/254724504290"
          }
        }
      }, { quoted: m })
    }

    const reply2 = (teks) => {
      X.sendMessage(from, { text: teks }, { quoted: m })
    }

    // Safe media send
    const safeSendMedia = async (jid, mediaObj, options = {}, sendOpts = {}) => {
      try {
        for (const key of ['image', 'video', 'audio', 'document', 'sticker']) {
          if (mediaObj[key]) {
            const val = mediaObj[key]
            if (val && typeof val === 'object' && val.url) {
              if (!val.url || val.url === 'undefined' || val.url === 'null' || val.url === undefined) {
                return reply('❌ Media URL is not available.')
              }
            } else if (val === undefined || val === null) {
              return reply('❌ Media data is not available.')
            }
          }
        }
        await X.sendMessage(jid, mediaObj, sendOpts)
      } catch (err) {
        console.error('Safe media send error:', err.message)
        reply('❌ Failed to send media: ' + (err.message || 'Unknown error'))
      }
    }

    // User Database
    const userDbPath = './database/users.json'
    function loadUsers() {
      try {
        if (!fs.existsSync(userDbPath)) return {}
        return JSON.parse(fs.readFileSync(userDbPath))
      } catch { return {} }
    }
    
    function saveUsers(data) {
      if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true })
      fs.writeFileSync(userDbPath, JSON.stringify(data, null, 2))
    }
    
    function trackUser(senderJid, name, cmd) {
      let users = loadUsers()
      const now = new Date().toISOString()
      if (!users[senderJid]) {
        users[senderJid] = { 
          name: name, 
          firstSeen: now, 
          lastSeen: now, 
          commandCount: 0, 
          commands: {} 
        }
      }
      users[senderJid].name = name
      users[senderJid].lastSeen = now
      users[senderJid].commandCount = (users[senderJid].commandCount || 0) + 1
      if (cmd) {
        users[senderJid].commands[cmd] = (users[senderJid].commands[cmd] || 0) + 1
      }
      saveUsers(users)
    }

    // Track command usage
    if (isCmd && command) {
      trackUser(sender, pushname, command)
      if (!isOwner && !isBot) {
        const userData = loadUsers()
        if (userData[sender]?.banned) {
          return reply('❌ You have been banned from using this bot.')
        }
      }
    }

    // PM Blocker
    if (global.pmBlocker && !m.isGroup && !isOwner && !isBot && !m.key.fromMe) {
      return reply('❌ Private messages are blocked. Use the bot in a group.')
    }

    // Auto react
    if (global.autoReact && m.key && !m.key.fromMe) {
      try { 
        await X.sendMessage(m.chat, { 
          react: { 
            text: global.autoReactEmoji || '👍', 
            key: m.key 
          } 
        }) 
      } catch {}
    }

    // Group security
    if (m.isGroup && !isAdmins && !isOwner) {
      // Anti-badword
      if (global.antiBadword && budy && global.badWords) {
        const hasBadword = global.badWords.some(w => budy.toLowerCase().includes(w))
        if (hasBadword && isBotAdmins) {
          await X.sendMessage(m.chat, { delete: m.key })
          await X.sendMessage(from, { 
            text: `⚠️ @${sender.split('@')[0]} watch your language!`, 
            mentions: [sender] 
          })
        }
      }
      
      // Anti-tag spam
      if (global.antiTag && m.mentionedJid && m.mentionedJid.length > 5 && isBotAdmins) {
        await X.sendMessage(m.chat, { delete: m.key })
        await X.sendMessage(from, { 
          text: `⚠️ @${sender.split('@')[0]} mass tagging is not allowed!`, 
          mentions: [sender] 
        })
        return
      }
      
      // Anti-sticker
      if (global.antiSticker && m.mtype === 'stickerMessage' && isBotAdmins) {
        await X.sendMessage(m.chat, { delete: m.key })
        return
      }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
    // COMMAND HANDLER
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
    
    if (isCmd) {
      switch(command) {
        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
        // MENU COMMAND - UPDATED STYLE
        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
        case 'menu':
        case 'help':
        case 'stem':
          const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
          const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
          const usedRam = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024
          const ramPercent = ((usedRam / totalRam) * 100).toFixed(1)
          const uptime = runtime(process.uptime())
          const speedMs = (speed() - speed()).toFixed(4)
          
          const menuText = `📜 *⛩️  *S͓͓͓͓U͓͓͓͓M͓͓͓͓M͓͓͓͓O͓͓͓͓N͓͓͓͓I͓͓͓͓N͓͓͓͓G͓͓͓͓*  ⛩️
      ⛩️  *S T E M*  ⛩️💨

🔥 *「 Obsession is a young man's game 」* 🩸

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ ${global.botname || 'UPGRADE IX MD'} v2.0 ⚡  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─「 ⚙️ SYSTEM STATUS 」─────────────
│ 👑 CREATOR: Victonnel Victonnel
│ 📋 COMMANDS: 100+
│ 📡 MODE: ${isGroup ? 'GROUP' : 'PRIVATE'}
│ 🔑 PREFIX: [ ${prefix} ]
│ ⚡ SPEED: ${speedMs}ms
│ 💾 USAGE: ${ramUsage} MB / ${totalRam} GB
│ 📊 RAM: ${'█'.repeat(Math.floor(ramPercent/10))}${'░'.repeat(10-Math.floor(ramPercent/10))} ${ramPercent}%
│ ⏱️  UPTIME: ${uptime}
└─────────────────────────────────

┌─「 🎯 GENERAL 」──────────────────
│ ├─ ${prefix}ping
│ ├─ ${prefix}uptime
│ ├─ ${prefix}owner
│ ├─ ${prefix}menu
│ ├─ ${prefix}help
│ └─ ${prefix}speed
└─────────────────────────────────

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🤖 AI & CHATBOT            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
├─ ${prefix}ai <text>
├─ ${prefix}gpt <text>
├─ ${prefix}chat <text>
└─ ${prefix}translate <lang> <text>

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👥 GROUP MANAGEMENT        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
├─
