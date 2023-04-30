import { Message } from "discord.js";
import database from "../../functions/core/database";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import { logMessage } from "../logging/loggingManager";
import { findMostRecentRaid } from "./award";

/**
 * @author Lewis Page
 * @description Removes a member from event attendance.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns The Message Reply Promise.
 */
export default async function eventRemove(message : Message, content : string[]){
    if(await requireContentLengthOf(message,content,3)) return;

    const memberIDs = content.slice(2).map(parseMentionedUser)

    for(let memberID of memberIDs){
        const member = await database.members.findFirst({where: {discordID: memberID, serverId: config.server_id}})
        if(!member){
            return message.reply({content: messages.no_user})
        }

        const recentRaid = findMostRecentRaid(await database.eventParticipationHistory.findMany({where: {member: member, serverId: config.server_id}}))
        if(!recentRaid){
            return message.reply({content: messages.no_event_history})
        }

        await database.eventParticipationHistory.delete({where: {id: recentRaid.id}})
        logMessage(`${message.author.username} deleted ${member.name}'s latest raid record`)
    }
    return message.reply(messages.event_participation_removal)
}