import {Message, VoiceChannel} from "discord.js";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import messages from "../../functions/models/messages";


/**
 * @author Lewis Page
 * @description The controller for the `$event attendance` command, allowing people to be added to event attendance automatically.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function eventAttendance(message : Message, content : string[]){
    const vc = await client.channels.fetch(config.event_voice_channel) as VoiceChannel
    const time = new Date();
    const ignoredUsers = content.slice(2).map(parseMentionedUser)

    const added : string[] = []
    for (let memberCollection of vc.members){
        const member = memberCollection[1];
        if(ignoredUsers.includes(member.id)) continue;

        const record = await database.members.findFirst({ where: {discordID: member.id, serverId: config.server_id} })
        if(!record) continue;

        await database.eventParticipationHistory.create({
            data: {
                member: {connect: {id: record.id}},
                eventDate: time,
                pointsAwarded: config.points_awarded_for_activities.events,
                serverId: config.server_id
            }
        })

        added.push(member.id)
    }

    if(added.length === 0) return message.reply(messages.no_attendance)

    let output = "✅ Added event attendance for: "
    for (let i = 0; i < added.length; i++){
        if(i !== 0){
            output += ", "
        }
        if(i + 1 === added.length && added.length !== 1){
            output += "and "
        }

        output += `<@${added[i]}>`
    }

    return message.reply({content: output})
}