import {GuildMember, Message, TextChannel} from "discord.js";
import authenticate from "../../functions/util/authenticate";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import client from "../../functions/core/serverInit";
import messages from "../../functions/models/messages";
import { AccessLevels } from "../../functions/models/accessLevels";

export async function removeOnLeave (message : Message){
    if(authenticate(message, AccessLevels.Moderation)) return

    // Get date and On Leave
    const date = new Date().getTime()

    // Get the On Leave records of those who have had it for over a month
    const onLeaveRecords = (await database.onLeave.findMany({include: {member: true}}))
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

export const removeSingleOnLeave = (updateDB : boolean) => async (member : GuildMember) => {
    if(updateDB) {
        const memberRecord = await database.members.findFirst({where: {discordID: member.id}})
        await Promise.all([ database.onLeave.updateMany({where: {membersId: memberRecord!.id}, data: {endingDate: new Date()}}), member.roles.remove(config.on_leave_role)])
    }
    else await member.roles.remove(config.on_leave_role)
}