import "dotenv/config";
import fs from "fs";
import path from "path";
import P from "pino";
import {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";

import config from "./config.js";

async function startBot() {
  // Load the latest WA version
  const { version } = await fetchLatestBaileysVersion();
  console.log(`Using WA version: ${version.join(".")}`);

  // Load authentication state
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    auth: state,
    browser: [config.botName, "Chrome", "1.0.0"],
  });

  // Save credentials on update
  sock.ev.on("creds.update", saveCreds);

  // Connection handler
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("🔌 Disconnected, reconnecting...", lastDisconnect?.error?.output?.statusCode);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log(`✅ ${config.botName} is connected!`);
    }
  });

  // Load commands dynamically
  const commands = new Map();
  const commandsPath = path.join(process.cwd(), "commands");

  if (fs.existsSync(commandsPath)) {
    const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      const command = await import(path.join(commandsPath, file));
      commands.set(command.default.name, command.default);
    }
  }

  // Message handler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    if (!text.startsWith(config.prefix)) return;

    const args = text.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(sock, msg, args, config);
    } catch (err) {
      console.error("❌ Command execution error:", err);
    }
  });
}

// Start the bot
startBot();
