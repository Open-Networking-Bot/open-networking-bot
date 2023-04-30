import {GuildMember} from "discord.js";
import {logMessage, logType} from "../logging/loggingManager";
import database from "../../functions/core/database";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description The controller to handle when people exit On Leave.
 * @param user The GuildMember who attempted to come off of On Leave.
 * @returns A log Promise.
 */
export default async function exitOnLeave(user : GuildMember){
    const member = await database.members.findFirst({where: {discordID: user.id, serverId: config.server_id}})
    if(!member) return logMessage
    (`${user.user.username} has not been added to the database, however has attempted to leave being on leave`
        ,logType.critical)

    await database.onLeave.updateMany({where: {membersId: member.id, serverId: config.server_id}, data: {endingDate: new Date()}})

    return logMessage(`${user.user.username} has left being on leave`)
}