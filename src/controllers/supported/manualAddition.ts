import { Message } from "discord.js";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import { logMessage } from "../logging/loggingManager";
import { recordHandle } from "./supportUpdating";

export default async function(handler : recordHandle, message : Message, content : string[]){
    const member = await database.members.findFirst({where: {discordID: parseMentionedUser(content[2])}})
    if(!member) return message.reply(messages.no_user_error_third_person)

    const amount = parseInt(content[3])
    if(isNaN(amount)) return message.reply(messages.not_a_number_tags)

    await handler(member, amount)

    logMessage(`${message.author.username} manually added ${amount} ${content[1]} tag${amount !== -1 && amount !== 1 ? "s" : ""} to ${member.name}`)
    return message.reply(messages.added_tags)
}