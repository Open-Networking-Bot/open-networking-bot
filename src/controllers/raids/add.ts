import {Message} from "discord.js";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import database from "../../functions/core/database";
import config from "../../functions/models/config";
import { logMessage } from "../logging/loggingManager";

export default async function (message : Message<boolean> ,content : string[]){

    const memberIDs = content.slice(2).map(parseMentionedUser)

    for(let memberID of memberIDs){
        const member = await database.members.findFirst({ where: {discordID: memberID} })

        if(!member){
            return message.reply(messages.no_user)
        }

        await database.raidParticipationHistory.create({
            data: {
                member: {connect: {id: member.id}},
                raidDate: new Date(),
                pointsAwarded: config.points_awarded_for_activities.raids
            }
        })

        logMessage(`${message.author.username} added a raid for ${member.name} for a raid`)
    }
    
    return message.reply({
        content: messages.added_raid
    })
}