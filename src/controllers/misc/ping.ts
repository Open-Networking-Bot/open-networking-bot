import {Message, MessagePayload} from "discord.js";
import config from "../../functions/models/config";

export default async function (message : Message){
    const sendingMessage = `
    🕜 Uptime: ${process.uptime()}
  🤖 Version: ${config.bot_version}
  😳 Having A Midlife Crisis: ${Math.random() > 0.8 ? "True" : "False"}
    `
    return message.reply(sendingMessage)
}