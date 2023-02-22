import {Message, VoiceChannel} from "discord.js";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import database from "../../functions/core/database";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import messages from "../../functions/models/messages";

export default async function (message : Message, content : string[]){
    const vc = await client.channels.fetch(config.raid_voice_channel) as VoiceChannel
    const time = new Date();
    const ignoredUsers = content.slice(2).map(parseMentionedUser)

    const added : string[] = []
    for (let memberCollection of vc.members){
        const member = memberCollection[1];
        if(ignoredUsers.includes(member.id)) continue;

        const record = await database.members.findFirst({ where: {discordID: member.id} })
        if(!record) continue;

        await database.raidParticipationHistory.create({
            data: {
                member: {connect: {id: record.id}},
                raidDate: time,
                pointsAwarded: config.points_awarded_for_activities.raids
            }
        })

        added.push(member.id)
    }

    if(added.length === 0) return message.reply(messages.no_attendance)

    let output = "✅ Added raid attendance for: "
    for (let i = 0; i < added.length; i++){
        if(i !== 0){
            output += ", "
        }
        if(i + 1 === added.length && added.length !== 1){
            output += "and "
        }

        output += `<@${added[i]}>`
    }

    return await message.reply({content: output})
}