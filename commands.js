module.exports = {
    name: "menu",
    description: "Dark Hacker Menu",
    async execute(sock, msg, args, config, commands) {

        const jid = msg.key.remoteJid;
        const user = "VICTONNEL";

        // ⚡ Hacker Boot Animation
        await sock.sendMessage(jid, {
            text: "```> INITIALIZING STEM CORE...```"
        });

        await new Promise(r => setTimeout(r, 900));

        await sock.sendMessage(jid, {
            text: "```> ACCESSING DARK PROTOCOL...```"
        });

        await new Promise(r => setTimeout(r, 900));

        await sock.sendMessage(jid, {
            text: "```> BYPASSING SECURITY FIREWALL...```"
        });

        await new Promise(r => setTimeout(r, 1200));

        // 🖤 Build Dark Boxed Menu
        let menuText = `
╔═━━━《 UPDATE IX MD 》━━━═╗

╔══════════════════════════════╗
║        DARK EXECUTION MODE        ║
╚══════════════════════════════╝

┌─[ SYSTEM STATUS ]
│ User   : ${user}
│ Mode   : STEALTH MATRIX
│ Prefix : ${config.prefix}
└──────────────────────────────

┌─[ COMMAND MATRIX ]
`;

        commands.forEach(cmd => {
            menuText += `│ ▸ ${config.prefix}${cmd.name}\n`;
        });

        menuText += `└──────────────────────────────

[✓] STEM CORE SUCCESSFULLY DEPLOYED 🪐
[✓] ROOT ACCESS GRANTED
[✓] SYSTEM CONTROLLED BY VICTONNEL
`;

        await sock.sendMessage(jid, {
            text: "```" + menuText + "```"
        });
    }
};
