import {Message} from "discord.js";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import database from "../../functions/core/database";
import config from "../../functions/models/config";
import { logMessage } from "../logging/loggingManager";

/**
 * @author Lewis Page
 * @description The controller for the `$event add` command, allowing people to be added to event attendance.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function eventAdd(message : Message<boolean>, content : string[]){

    const memberIDs = content.slice(2).map(parseMentionedUser)

    for(let memberID of memberIDs){
        const member = await database.members.findFirst({ where: {discordID: memberID, serverId: config.server_id} })

        if(!member){
            return message.reply(messages.no_user)
        }

        await database.eventParticipationHistory.create({
            data: {
                member: {connect: {id: member.id}},
                eventDate: new Date(),
                pointsAwarded: config.points_awarded_for_activities.events,
                serverId: config.server_id
            }
        })

        logMessage(`${message.author.username} added event attendance for ${member.name}`)
    }
    
    return message.reply({
        content: messages.added_event
    })
}