import { Message } from "discord.js";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Adds a comment onto the weekly review, regarding a member. Invoked with `$user comment`
 * @param message The Discord Message
 * @param content The Message's content, split by spaces.
 * @returns A message reply promise
 */
export default async function changeComment(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 4)) return;
    
    const usr = await database.members.updateMany({
        where: {
            discordID: parseMentionedUser(content[2]),
            serverId: config.server_id
        },
        data: { comments: content.slice(3).join(' ') }
    })
    if(!usr){
        return message.reply({content: messages.no_user})
    }

    return message.reply({content: messages.added_comment})
}