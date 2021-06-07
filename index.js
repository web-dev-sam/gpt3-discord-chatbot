
const Discord = require('discord.js');
const AI = require('./ai');
const config = require('./config');

const client = new Discord.Client();
const ai = new AI();

client.on('ready', ready);
client.on('message', onMessage);
client.login(config.DISCORD_TOKEN);


function ready() {
    console.log(`Logged in as ${client.user.tag}!`);
}


let processing = false;
async function onMessage(msg) {

    const message = msg.content.trim();

    // Output channel id of message
    if (message === "!channel") {
        console.log("Text Channel: ", msg.channel.id);
        return;
    }

    if (msg.channel.id !== config.TEXT_CHANNEL || msg.author.bot || processing)
        return;

    // Start a new conversation with the bot
    if (message === "!reset") {
        ai.conversation = [];
        msg.reply("Memory erased successfully!\n\n Hello, I am an AI created by OpenAI. How can I help you today?");
        return;
    }

    // Show current conversation
    if (message === "!memory") {
        let mem = "\n";
        for (const m of ai.conversation) {
            mem += `\n${m.author ? "You" : "AI"}: ${m.prompt}`;
        }
        msg.reply(mem);
        return;
    }

    // Chat with human
    processing = true;
    ai.human(message);
    const answer = await ai.completion();
    ai.ai(answer.choices[0].text.trim());
    msg.channel.send(answer.choices[0].text.trim());
    processing = false;
}
