import {GuildMember, Message, PartialGuildMember, User} from "discord.js";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import messages from "../../functions/models/messages";
import database from "../../functions/core/database";
import { logMessage } from "../logging/loggingManager";
import { members } from "@prisma/client";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";

export async function leaveAuto(member : GuildMember | PartialGuildMember){
    const m = await database.members.findFirst({where: {discordID: member.id}})

    await leave(m)
    logMessage(member.displayName + " has been wiped from the database entirely.")
}

export async function leaveManual(message : Message<boolean>, content : string[]){

    if(await requireContentLengthOf(message, content, 3)) return;

    const m = await database.members.findFirst({where: {discordID: parseMentionedUser(content[2])}})

    if(!m){
        return message.reply(messages.no_user)
    }
    const res = await leave(m)

    return message.reply( {content: res?
            `✅ ${m.name} has been wiped from the database entirely`:
            messages.no_user_error_third_person
    })
}

async function leave(member : members | null) : Promise<boolean>{
    if(!member) return false;

    const deleteMember = database.members.delete({where: {id: member.id}})
    const deleteRaidParticipation = database.raidParticipationHistory.deleteMany({where: {membersId: member.id}})
    const deleteSupport = database.support.deleteMany({where: {membersId: member.id}})
    const deleteSlots = database.expressTimetable.deleteMany({where: {membersId: member.id}})
    const deleteLeave = database.onLeave.deleteMany({where: {membersId: member.id}})

    await database.$transaction([deleteRaidParticipation, deleteSupport, deleteSlots, deleteLeave])
    await deleteMember
    
    return true;
}
