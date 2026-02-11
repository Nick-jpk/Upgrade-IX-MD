require("dotenv").config();
const fs = require("fs");
const path = require("path");
const P = require("pino");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require("@whiskeysockets/baileys");

const config = require("./config");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state,
        browser: [config.botName, "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log(`✅ ${config.botName} is connected!`);
        }
    });

    // Load Commands
    const commands = new Map();
    const commandsPath = path.join(__dirname, "commands");

    if (fs.existsSync(commandsPath)) {
        const files = fs.readdirSync(commandsPath);
        for (const file of files) {
            if (file.endsWith(".js")) {
                const command = require(`./commands/${file}`);
                commands.set(command.name, command);
            }
        }
    }

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text || !text.startsWith(config.prefix)) return;

        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(sock, msg, args, config);
        } catch (err) {
            console.error(err);
        }
    });
}

startBot();
