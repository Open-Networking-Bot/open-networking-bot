import {GuildMember, Message, TextChannel} from "discord.js";
import authenticate from "../../functions/util/authenticate";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import client from "../../functions/core/serverInit";
import messages from "../../functions/models/messages";
import { AccessLevels } from "../../functions/models/accessLevels";

/**
 * @author Lewis Page
 * @description Removes everyone from On Leave who shouldn't be on it. Invoked with `$onleave revoke`
 * @param message The Discord Message, sent.
 * @returns A Message Reply Promise.
 */
export async function removeOnLeave(message : Message){
    if(authenticate(message, AccessLevels.Moderation)) return;

    // Get date and On Leave
    const date = new Date().getTime()

    // Get the On Leave records of those who have had it for over a month
    const onLeaveRecords = (await database.onLeave.findMany({where: {serverId: config.server_id}, include: {member: true}}))
        .filter(i => date - i.startingDate.getTime() > (2628000 * 1000))

    // Get the members to remove roles from
    const databaseMemberRecords = onLeaveRecords.map(i => i.member.discordID)
    const membersToPurge = ((await client.channels.fetch(config.general_channel))! as TextChannel).members
        .filter(x => databaseMemberRecords.some(y => x.id === y))

    // Remove roles
    membersToPurge.forEach(removeSingleOnLeave(true))

    // Reply to end-user
    return message.reply({content: messages.on_leave_roles_purged})
}

/**
 * @author Lewis Page
 * @description Removes one GuildMember from On Leave. This function is curried.
 * @param updateDB Wether to update the database with the command itself.
 * @param member The Guild Member to be kicked from On Leave
 */
export const removeSingleOnLeave = (updateDB : boolean) => async (member : GuildMember) => {
    if(updateDB) {
        const memberRecord = await database.members.findFirst({where: {discordID: member.id, serverId: config.server_id}})
        await Promise.all([ database.onLeave.updateMany({where: {membersId: memberRecord!.id, serverId: config.server_id}, data: {endingDate: new Date()}}), member.roles.remove(config.on_leave_role)])
    }
    else await member.roles.remove(config.on_leave_role)
}