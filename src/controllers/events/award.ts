import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import {Message} from "discord.js";
import validator from "validator";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import database from "../../functions/core/database";
import { eventParticipationHistory } from "@prisma/client";
import { logMessage } from "../logging/loggingManager";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Given a list of events participated in, the most recent event will be returned.
 * @param events The event participation logs to sort through.
 * @returns The most recent event, given.
 */
export function findMostRecentRaid(events : eventParticipationHistory[]) {
    let mostRecent: eventParticipationHistory | undefined = undefined
    for (let event of events) if (!mostRecent || event.eventDate.getTime() > mostRecent.eventDate.getTime()) mostRecent = event
    return mostRecent
}

/**
 * @author Lewis Page
 * @description The controller for the `$event award` command, allowing the points from an event attendance to be changed.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function eventAward(message : Message, content : string[]){
    if(await requireContentLengthOf(message,content,4)) return;

    if(!validator.isNumeric(content[2])){
        return message.reply({content: messages.not_a_number})
    }

    const points = parseInt(content[2])
    let deleting = points <= 0

    const memberIDs = content.slice(3).map(parseMentionedUser)

    for(let memberID of memberIDs){
        const member = await database.members.findFirst({where: {discordID: memberID, serverId: config.server_id}})
        if(!member){
            return message.reply({content: messages.no_user})
        }

        const recentRaid = findMostRecentRaid(await database.eventParticipationHistory.findMany({where: {membersId: member.id, serverId: config.server_id}}))
        if(!recentRaid){
            return message.reply({content: messages.no_event_history})
        }


        if(deleting){
            logMessage(`${message.author.username} deleted ${member.name}'s latest event record`)
            await database.eventParticipationHistory.delete({where: {id: recentRaid.id}})
            continue
        }

        await database.eventParticipationHistory.update({
            where: {id: recentRaid.id},
            data: {pointsAwarded: points}
        })

        logMessage(`${message.author.username} changed ${member.name}'s latest event's points to ${points}`)
    }
    return message.reply(messages.point_change)
}