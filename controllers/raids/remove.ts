import { Message } from "discord.js";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import { logMessage } from "../logging/loggingManager";
import { findMostRecentRaid } from "./award";

export default async function (message : Message, content : string[]){
    if(await requireContentLengthOf(message,content,3)) return;

    const memberIDs = content.slice(2).map(parseMentionedUser)

    for(let memberID of memberIDs){
        const member = await database.members.findFirst({where: {discordID: memberID}})
        if(!member){
            return message.reply({content: messages.no_user})
        }

        const recentRaid = findMostRecentRaid(await database.raidParticipationHistory.findMany({where: {member: member}}))
        if(!recentRaid){
            return message.reply({content: messages.no_raid_history})
        }

        await database.raidParticipationHistory.delete({where: {id: recentRaid.id}})
        logMessage(`${message.author.username} deleted ${member.name}'s latest raid record`)
    }
    return message.reply(messages.raid_participation_removal)
}