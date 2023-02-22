import {Message} from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import dmUser from "../../functions/util/dmUser";
import findLastMonday from "../../functions/features/findLastMonday";
import messages from "../../functions/models/messages";
import authenticate from "../../functions/util/authenticate";
import { AccessLevels } from "../../functions/models/accessLevels";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";

export default async function (message : Message, content : string[]){

    let currentTarget = message.member!.id
    if(content.length > 1){
        if(authenticate(message, AccessLevels.Council)) return;
        currentTarget = parseMentionedUser(content[1])
    }

    const isPersonal = currentTarget === message.member!.id

    const member = (await database.members.findFirst({where: {discordID: currentTarget}}))
    if(!member) return message.reply(isPersonal ? messages.no_user_error : messages.no_user)

    const raidHistory = await database.raidParticipationHistory.findMany({where: {membersId: member.id}})
    const pointsHistory = await database.support.findMany({where: {membersId: member.id}})

    const weekStart = findLastMonday()

    let totalRaidPoints = 0
    for (let entry of raidHistory){
        if(entry.raidDate.getTime() >= weekStart.getTime()){
            totalRaidPoints += entry.pointsAwarded
        }
    }

    let totalExpressPoints = 0
    let totalSupportPoints = 0
    let totalShoutoutPoints = 0
    let totalInvitePoints = 0
    if (pointsHistory) for (let entry of pointsHistory){
        if(entry.date.getTime() >= weekStart.getTime()){
            totalExpressPoints += entry.expressSupport * config.points_awarded_for_activities.express_support
            totalSupportPoints += entry.whoISupported * config.points_awarded_for_activities.who_I_supported
            totalShoutoutPoints += entry.shoutOutSupport * config.points_awarded_for_activities.shout_out_support
            totalInvitePoints += entry.inviteSupport * config.points_awarded_for_activities.invited_support
        }
    }

    totalExpressPoints = totalExpressPoints > 10 && config.express_clamp_type !== "none" ? 10 : totalExpressPoints

    //const totalPoints = totalRaidPoints + totalSupportPoints + totalExpressPoints

    const pronoun = isPersonal ? "You" : "They"

    await dmUser(message.member!,{
        embeds: [
            {
                "title": `SSS Progress Report`,
                "description": `Here is ${isPersonal ? "your progress" : `${member.name}'s progress`} this week:`,
                "color": 0x7300bf,
                "fields": [
                    {
                        "name": `Raid Trains 🚂`,// (<#${config.raid_info_channel}>)`,
                        "value": `${pronoun} have gained ${totalRaidPoints} points from raid trains this week.`
                    },
                    {
                        "name": `Express Support 🚅`,// (<#${config.rules_and_how_it_works_channel}>)`,
                        "value": `${pronoun} have gained ${totalExpressPoints} points from the express this week.`
                    },
                    {
                        "name": `Support Network 🖥`,// (<#${config.support_network_info_channel}>)`,
                        "value": `${pronoun} have gained ${totalSupportPoints} points from watching SSS members this week.`
                    },
                    {
                        "name": `Shoutout Attendance 📣`,// (<#${config.rules_and_how_it_works_channel}>)`,
                        "value": `${pronoun} have gained ${totalShoutoutPoints} points from attending members who have been shouted out.`
                    },
                    {
                        "name": `Invite Support 🔭`,
                        "value": `${pronoun} have gained ${totalInvitePoints} points from either saying who you were invited by or inviting someone to the server.`
                    },
                    {
                        "name": `Stage ℹ`,
                        "value": (()=>{
                            let output = `${isPersonal ? "You" : "They"} are currently on stage ${member.numberOfWarnings}: this means that `
                            switch (member.numberOfWarnings) {
                                case 0: output += `${pronoun.toLowerCase()} met all criteria last week!`; break;
                                case 1: output += `${pronoun.toLowerCase()} received a warning last week for not meeting criteria. If ${pronoun.toLowerCase()} do not meet criteria this week, ${isPersonal ? "your" : "their"} level/XP may be reset and ${pronoun.toLowerCase()} will end up losing ${isPersonal ? "your" : "their"} roles.`; break;
                                case 2: output += `${isPersonal ? "your" : "their"} level/XP/Roles were reset last week for not meeting criteria. ${pronoun} may be kicked from the server if ${pronoun.toLowerCase()} do not meet criteria this week.`; break;
                                default: output += `${pronoun.toLowerCase()} have repeatedly not met criteria. Please note that ${pronoun.toLowerCase()} may be kicked from the server due to not meeting the requirements.`; break;
                            }
                            return output
                        })()
                    }
                ],
                "footer": {
                    "text": `${pronoun} need an average of ${config.minimum_points_required_per_week} points or greater over ${config.weeks_for_average} weeks to meet the criteria for staying in the server and ${config.minimum_points_required_for_express} points + ${config.minimum_express_tags_required_for_express} Express Support Tags to enter the Express.`
                }
            }
        ]
    },message)
}