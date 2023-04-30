import {Message, MessagePayload} from "discord.js";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Sends an informative message to the end-user, when the `$ping` command is invoked.
 * @param message the Discord Message, sent.
 * @returns a Message Reply Promise.
 */
export default async function pingController(message : Message){
    const sendingMessage = `
    🕜 Uptime: ${process.uptime()}
  🤖 Version: ${config.bot_version}
  😳 Having A Midlife Crisis: ${Math.random() > 0.8 ? "True" : "False"}
    `
    return message.reply(sendingMessage)
}