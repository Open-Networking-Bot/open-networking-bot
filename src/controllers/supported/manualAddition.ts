import { Message } from "discord.js";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import { logMessage } from "../logging/loggingManager";
import { recordHandle } from "./supportUpdating";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Manually adds support points to a given member. Controls the `$tag` category.
 * @param handler The handler, which adds the points provided.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function manualAddition(handler : recordHandle, message : Message, content : string[]){
    const member = await database.members.findFirst({where: {discordID: parseMentionedUser(content[2]), serverId: config.server_id}})
    if(!member) return message.reply(messages.no_user_error_third_person)

    const amount = parseInt(content[3])
    if(isNaN(amount)) return message.reply(messages.not_a_number_tags)

    await handler(member, amount)

    logMessage(`${message.author.username} manually added ${amount} ${content[1]} tag${amount !== -1 && amount !== 1 ? "s" : ""} to ${member.name}`)
    return message.reply(messages.added_tags)
}