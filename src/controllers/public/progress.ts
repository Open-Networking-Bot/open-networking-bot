import {Message} from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import dmUser from "../../functions/util/dmUser";
import findLastMonday from "../../functions/features/findLastMonday";
import messages from "../../functions/models/messages";
import authenticate from "../../functions/util/authenticate";
import { AccessLevels } from "../../functions/models/accessLevels";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import { SupportTypes } from "../../functions/models/supportTypes";

/**
 * @author Lewis Page
 * @description Sends the end-user a DM, showing their support, when they type `$progress`.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 */
export default async function progressController(message : Message, content : string[]){

    let currentTarget = message.member!.id
    if(content.length > 1){
        if(authenticate(message, AccessLevels.Admin)) return;
        currentTarget = parseMentionedUser(content[1])
    }

    const isPersonal = currentTarget === message.member!.id

    const member = (await database.members.findFirst({where: {discordID: currentTarget, serverId: config.server_id}}))
    if(!member) return message.reply(isPersonal ? messages.no_user_error : messages.no_user)

    const eventHistory = await database.eventParticipationHistory.findMany({where: {membersId: member.id}})
    const pointsHistory = await database.support.findMany({where: {membersId: member.id}})

    const weekStart = findLastMonday()

    let totalEventPoints = 0
    for (let entry of eventHistory){
        if(entry.eventDate.getTime() >= weekStart.getTime()){
            totalEventPoints += entry.pointsAwarded
        }
    }

    let totalCalendarPoints = 0
    let totalSupportPoints = 0
    let totalShoutoutPoints = 0
    let totalInvitePoints = 0
    if (pointsHistory) for (let entry of pointsHistory){
        if(entry.date.getTime() >= weekStart.getTime()){
            switch(entry.type){
                case SupportTypes.support:
                    totalSupportPoints += entry.value * config.points_awarded_for_activities.who_I_supported
                    break
                case SupportTypes.shoutout:
                    totalShoutoutPoints += entry.value * config.points_awarded_for_activities.shout_out_support
                    break
                case SupportTypes.invite:
                    totalInvitePoints += entry.value * config.points_awarded_for_activities.invited_support
                    break
                case SupportTypes.calendar:
                    totalCalendarPoints += entry.value * config.points_awarded_for_activities.calendar_support
            }
        }
    }

    totalCalendarPoints = totalCalendarPoints > 10 && config.calendar_clamp_type !== "none" ? 10 : totalCalendarPoints

    const pronoun = isPersonal ? "You" : "They"

    await dmUser(message.member!,{
        embeds: [
            {
                "title": `Progress Report`,
                "description": `Here is ${isPersonal ? "your progress" : `${member.name}'s progress`} this week:`,
                "color": 0x7300bf,
                "fields": [
                    {
                        "name": `Event Trains 🚂`,// (<#${config.event_info_channel}>)`,
                        "value": `${pronoun} have gained ${totalEventPoints} points from event trains this week.`
                    },
                    {
                        "name": `Calendar Support 🚅`,// (<#${config.rules_and_how_it_works_channel}>)`,
                        "value": `${pronoun} have gained ${totalCalendarPoints} points from calendar events this week.`
                    },
                    {
                        "name": `Support Network 🖥`,// (<#${config.support_network_info_channel}>)`,
                        "value": `${pronoun} have gained ${totalSupportPoints} points from watching members this week.`
                    },
                    {
                        "name": `Shoutout Attendance 📣`,// (<#${config.rules_and_how_it_works_channel}>)`,
                        "value": `${pronoun} have gained ${totalShoutoutPoints} points from attending members who have been shouted out.`
                    },
                    {
                        "name": `Invite Support 🔭`,
                        "value": `${pronoun} have gained ${totalInvitePoints} points from either saying who you were invited by or inviting someone to the server.`
                    }
                ]
            }
        ]
    },message)
}