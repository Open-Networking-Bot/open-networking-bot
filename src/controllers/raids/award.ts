import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import {Message} from "discord.js";
import validator from "validator";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import database from "../../functions/core/database";
import { raidParticipationHistory } from "@prisma/client";
import { logMessage } from "../logging/loggingManager";

export function findMostRecentRaid(raids : raidParticipationHistory[]) {
    let mostRecent: raidParticipationHistory | undefined = undefined
    for (let raid of raids) if (!mostRecent || raid.raidDate.getTime() > mostRecent.raidDate.getTime()) mostRecent = raid
    return mostRecent
}

export default async function (message : Message, content : string[]){
    if(await requireContentLengthOf(message,content,4)) return;

    if(!validator.isNumeric(content[2])){
        return message.reply({content: messages.not_a_number})
    }

    const points = parseInt(content[2])
    let deleting = points <= 0

    const memberIDs = content.slice(3).map(parseMentionedUser)

    for(let memberID of memberIDs){
        const member = await database.members.findFirst({where: {discordID: memberID}})
        if(!member){
            return message.reply({content: messages.no_user})
        }

        const recentRaid = findMostRecentRaid(await database.raidParticipationHistory.findMany({where: {member: member}}))
        if(!recentRaid){
            return message.reply({content: messages.no_raid_history})
        }


        if(deleting){
            logMessage(`${message.author.username} deleted ${member.name}'s latest raid record`)
            await database.raidParticipationHistory.delete({where: {id: recentRaid.id}})
            continue
        }

        await database.raidParticipationHistory.update({
            where: {id: recentRaid.id},
            data: {pointsAwarded: points}
        })

        logMessage(`${message.author.username} changed ${member.name}'s latest raid's points to ${points}`)
    }
    return message.reply(messages.point_change)
}