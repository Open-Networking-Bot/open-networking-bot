import {GuildMember} from "discord.js";
import {logMessage, logType} from "../logging/loggingManager";
import database from "../../functions/core/database";

export default async function (user : GuildMember){
    const member = await database.members.findFirst({where: {discordID: user.id}})
    if(!member) return logMessage
    (`${user.user.username} has not been added to the SSS's database, however has attempted to leave being on leave`
        ,logType.critical)

    await database.onLeave.updateMany({where: {membersId: member.id}, data: {endingDate: new Date()}})

    return logMessage(`${user.user.username} has left being on leave`)
}