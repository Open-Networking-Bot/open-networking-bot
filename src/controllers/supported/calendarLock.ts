import { Message } from "discord.js";
import database from "../../functions/core/database";
import FeatureLock from "../../functions/features/featureLock";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";

export const Lock = new FeatureLock(async () => {
    return (await database.calendarConfig.findMany({where: {serverId: config.server_id}}))[0].calendarLock
},
async (curr) => {
    await database.calendarConfig.updateMany({data: {calendarLock: curr}, where: {serverId: config.server_id}})
})

/**
 * @author Lewis Page
 * @description Toggles the calendar point lock, when the `$calendar lock` command is invoked.
 * @param message The Discord Message, sent.
 * @returns A message reply promise
 */
export default async function toggleCalendarLock(message : Message){
    const locked = await Lock.toggle()

    return message.reply({content: 
        locked ?
        messages.lock_calendar :
        messages.unlock_calendar
    })
}