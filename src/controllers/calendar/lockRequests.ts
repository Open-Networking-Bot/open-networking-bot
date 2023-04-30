import { Message } from "discord.js";
import database from "../../functions/core/database";
import FeatureLock from "../../functions/features/featureLock";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";

export const Lock = new FeatureLock(async () => {
    return (await database.calendarConfig.findMany({where: {serverId: config.server_id}}))[0].requestLock
},
async (curr) => {
    await database.calendarConfig.updateMany({data: {requestLock: curr}, where: {serverId: config.server_id}})
})

/**
 * @author Lewis Page
 * @description Locks `request-a-slot`, when `$calendar lock` is invoked.
 * @param message The Discord Message
 * @returns A promise, containing the message reply
 */
export default async function lockRequests(message : Message){
    const locked = await Lock.toggle()

    return message.reply({content: 
        locked ?
        messages.lock_request_a_slot :
        messages.unlock_request_a_slot
    })
}