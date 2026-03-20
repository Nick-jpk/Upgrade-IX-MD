const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const streamPipeline = promisify(require('stream').pipeline)

// Fetch JSON from URL
const fetchJson = async (url, options = {}) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      ...options
    })
    return response.data
  } catch (error) {
    console.error('fetchJson error:', error.message)
    return null
  }
}

// Get buffer from URL
const getBuffer = async (url, options = {}) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      ...options
    })
    return Buffer.from(response.data, 'binary')
  } catch (error) {
    console.error('getBuffer error:', error.message)
    return null
  }
}

// Fetch buffer (alias)
const fetchBuffer = getBuffer

// Get group admins
const getGroupAdmins = (participants) => {
  const admins = []
  for (const participant of participants) {
    if (participant.admin === 'admin' || participant.admin === 'superadmin') {
      admins.push(participant.id)
    }
  }
  return admins
}

// Upload to Telegraph (image hosting)
const TelegraPh = async (buffer) => {
  try {
    const FormData = require('form-data')
    const form = new FormData()
    form.append('file', buffer, { filename: 'image.jpg' })
    
    const response = await axios.post('https://telegra.ph/upload', form, {
      headers: form.getHeaders()
    })
    
    if (response.data && response.data[0] && response.data[0].src) {
      return 'https://telegra.ph' + response.data[0].src
    }
    return null
  } catch (error) {
    console.error('TelegraPh error:', error.message)
    return null
  }
}

// Check if string is URL
const isUrl = (text) => {
  const urlRegex = /^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$/
  return urlRegex.test(text)
}

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Clock string
const clockString = (ms) => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${h}h ${m}m ${s}s`
}

// Runtime calculation
const runtime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor(seconds % (3600 * 24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)
  return `${d}d ${h}h ${m}m ${s}s`
}

// Get current date
const tanggal = () => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get random item from array
const getRandom = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Check bandwidth usage
const checkBandwidth = async () => {
  try {
    const nets = require('os').networkInterfaces()
    let total = { rx: 0, tx: 0 }
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          // Note: This is a simplified version
          total.rx += 0
          total.tx += 0
        }
      }
    }
    return total
  } catch {
    return { rx: 0, tx: 0 }
  }
}

// Countdown function
const hitungmundur = (tanggal, bulan, tahun) => {
  const now = new Date()
  const target = new Date(tahun, bulan - 1, tanggal)
  const diff = target - now
  
  if (diff < 0) return 'Event has passed'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${days} days, ${hours} hours, ${minutes} minutes`
}

// Serialize message (smsg)
const smsg = (conn, m, store) => {
  if (!m) return m
  let M = proto.WebMessageInfo
  if (m.key) {
    m.id = m.key.id
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat.endsWith('@g.us')
    m.sender = m.fromMe ? conn.user.id : m.participant ? m.participant : m.key.participant ? m.key.participant : m.chat
  }
  if (m.message) {
    m.mtype = getContentType(m.message)
    m.msg = m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]
    m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage' && m.msg.singleSelectReply.selectedRowId) || (m.mtype == 'buttonsResponseMessage' && m.msg.selectedButtonId) || (m.mtype == 'viewOnceMessage' && m.msg.caption) || ''
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
  }
  return m
}

module.exports = {
  fetchJson,
  getBuffer,
  fetchBuffer,
  getGroupAdmins,
  TelegraPh,
  isUrl,
  sleep,
  clockString,
  runtime,
  tanggal,
  getRandom,
  checkBandwidth,
  hitungmundur,
  smsg
}
'''

os.makedirs('/mnt/kimi/output/Upgrade-IX-MD/library/lib', exist_ok=True)

with open('/mnt/kimi/output/Upgrade-IX-MD/library/lib/myfunc.js', 'w') as f:
    f.write(myfunc_content)

print("✅ library/lib/myfunc.js created successfully!")t || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.tex // (m.mtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.mtype == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (m.mtype == 'listResponseMessage') && m.message.listResponseMessage.singleSelectReply.selectedRowId ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'buttonsResponseMessage') && m.message.buttonsResponseMessage.selectedButtonId ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : ''
                
                try {
                        m.body =
                                m.message.conversation ||
                                m.message[m.type].text ||
                                m.message[m.type].caption ||
                                (m.type === "listResponseMessage" && m.message[m.type].singleSelectReply.selectedRowId) ||
                                (m.type === "buttonsResponseMessage" &&
                                        m.message[m.type].selectedButtonId) ||
                                (m.type === "templateButtonReplyMessage" && m.message[m.type].selectedId) ||
                                "";
                } catch {
                        m.body = "";
                }
                
                
                
                // t
                let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
                //m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
                m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
                if (m.quoted) {
                        let type = Object.keys(quoted)[0]
                        m.quoted = m.quoted[type]
                        if (['productMessage'].includes(type)) {
                                type = getContentType(m.quoted)
                                m.quoted = m.quoted[type]
                        }
                        if (typeof m.quoted === 'string') m.quoted = {
                                text: m.quoted
                        }
                        m.quoted.mtype = type
                        m.quoted.id = m.msg.contextInfo.stanzaId
                        m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
                        m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
                        m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
                        m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.jid)
                        m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
                        m.quoted.mentionedJid = m.quoted.contextInfo ? m.quoted.contextInfo.mentionedJid : []
                        m.getQuotedObj = m.getQuotedMessage = async () => {
                                if (!m.quoted.id) return false
                                let q = await store.loadMessage(m.chat, m.quoted.id, conn)
                                return exports.smsg(conn, q, store)
                        }
                        let vM = m.quoted.fakeObj = M.fromObject({
                                key: {
                                        remoteJid: m.quoted.chat,
                                        fromMe: m.quoted.fromMe,
                                        id: m.quoted.id
                                },
                                message: quoted,
                                ...(m.isGroup ? {
                                        participant: m.quoted.sender
                                } : {})
                        })

                        /**
                         * 
                         * @returns 
                         */
                        m.quoted.delete = () => conn.sendMessage(m.quoted.chat, {
                                delete: vM.key
                        })

                        /**
                         * 
                         * @param {*} jid 
                         * @param {*} forceForward 
                         * @param {*} options 
                         * @returns 
                         */
                        m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options)

                        /**
                         *
                         * @returns
                         */
                        m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
                }
        }
    if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg)
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
    /**
        * Reply to this message
        * @param {String|Object} text 
        * @param {String|false} chatId 
        * @param {Object} options 
        */
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : conn.sendText(chatId, text, m, { ...options })
    /**
        * Copy this message
        */
        m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))

        /**
         * 
         * @param {*} jid 
         * @param {*} forceForward 
         * @param {*} options 
         * @returns 
         */
        m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options)

    return m
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
        fs.unwatchFile(file)
        console.log(chalk.redBright(`Update ${__filename}`))
        delete require.cache[file]
        require(file)
})
