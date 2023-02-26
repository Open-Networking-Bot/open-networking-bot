import { Message } from "discord.js";
import { AccessLevels } from "../../functions/models/accessLevels";
import authenticate from "../../functions/util/authenticate";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";

export default async function(message : Message, content : string[]){
    if(authenticate(message, AccessLevels.Express) || await requireContentLengthOf(message, content, 4)) return;
    
    const usr = await database.members.updateMany({
        where: {
            discordID: parseMentionedUser(content[2])
        },
        data: { comments: content.slice(3).join(' ') }
    })
    if(!usr){
        return message.reply({content: messages.no_user})
    }

    message.reply({content: messages.added_comment})
}