import {GuildMember, Message, PartialGuildMember, User} from "discord.js";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import messages from "../../functions/models/messages";
import database from "../../functions/core/database";
import { logMessage } from "../logging/loggingManager";
import { members } from "@prisma/client";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description When a member leaves the server, the function deletes all their database information.
 * @param member The member being deleted
 */
export async function leaveAuto(member : GuildMember | PartialGuildMember){
    const m = await database.members.findFirst({where: {discordID: member.id, serverId: config.server_id}})

    await leave(m)
    logMessage(member.displayName + " has been wiped from the database entirely")
}

/**
 * @author Lewis Page
 * @description Deletes a member from the database, when the `$user remove` command is invoked.
 * @param message The Discord Message, sent
 * @param content The Message's content, split by spaces
 * @returns The Message Reply Promise
 */
export async function leaveManual(message : Message<boolean>, content : string[]){

    if(await requireContentLengthOf(message, content, 3)) return;

    const m = await database.members.findFirst({where: {
        discordID: parseMentionedUser(content[2]), 
        serverId: config.server_id
    }})

    if(!m){
        return message.reply(messages.no_user)
    }
    const res = await leave(m)

    return message.reply( {content: res?
            `✅ ${m.name} has been wiped from the database entirely`:
            messages.no_user_error_third_person
    })
}
/**
 * @author Lewis Page
 * @description Deletes a member, and its relations, from the database.
 * @param member The member, or lack theirof, to remove.
 * @returns If a member was deleted or not
 */
async function leave(member : members | null) : Promise<boolean>{
    if(!member) return false;

    const deleteMember = database.members.delete({where: {id: member.id}})
    const deleteEventParticipation = database.eventParticipationHistory.deleteMany({where: {membersId: member.id}})
    const deleteSupport = database.support.deleteMany({where: {membersId: member.id}})
    const deleteSlots = database.calendarTimetable.deleteMany({where: {membersId: member.id}})
    const deleteLeave = database.onLeave.deleteMany({where: {membersId: member.id}})

    await database.$transaction([deleteEventParticipation, deleteSupport, deleteSlots, deleteLeave])
    await deleteMember
    
    return true;
}