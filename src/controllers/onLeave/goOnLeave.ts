import {GuildMember} from "discord.js";
import {logMessage, logType} from "../logging/loggingManager";
import database from "../../functions/core/database";
import {removeSingleOnLeave} from "./removeOnLeave";
import dmUser from "../../functions/util/dmUser";
import messages from "../../functions/models/messages";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description The controller to handle if someone goes On Leave.
 * @param user The GuildMember, who went On Leave
 * @returns A Log Promise.
 */
export default async function goOnLeave(user : GuildMember){
    const member = await database.members.findFirst({where: {discordID: user.id, serverId: config.server_id}})
    if(!member) return logMessage
    (`${user.user.username} has not been added to the database, however has attempted to go on leave`
        ,logType.critical)

    let onLeaveRecord = await database.onLeave.findFirst({where: {membersId: member.id, serverId: config.server_id}})
    if(!onLeaveRecord) onLeaveRecord = await database.onLeave.create({data: {
        membersId: member.id,
            startingDate: new Date(),
            endingDate: null,
            serverId: config.server_id
    }})

    const date = new Date()

    if(onLeaveRecord.endingDate &&  date.getTime() - onLeaveRecord.endingDate.getTime() <= 604800000){
        return Promise.all([
            removeSingleOnLeave(false)(user),
            dmUser(user,{content: messages.not_eligible_for_on_leave}),
            logMessage(`${user.user.username} tried to go On Leave, however was not eligible`, logType.warning)
        ])
    }

    if(onLeaveRecord) await database.onLeave.update({where: {id: onLeaveRecord.id}, data: {startingDate: date}})

    return logMessage(`${user.user.username} has gone on leave`)
}