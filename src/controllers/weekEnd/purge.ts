import {Message} from "discord.js";
import messages from "../../functions/models/messages";
import authenticate from "../../functions/util/authenticate";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import { AccessLevels } from "../../functions/models/accessLevels";
import { DAY } from "../../functions/core/magicNumbers";

/**
 * @author Lewis Page
 * @description Purges all point data in the database from over a number of weeks ago, when the `$purge` command is invoked.
 * @param message The Discord Message, sent.
 * @returns A Message Reply Promise.
 */
export default async function databasePurge(message : Message){

    if(authenticate(message, AccessLevels.Admin)) return;

    const monthAgo = new Date (new Date().getTime() - DAY * config.purge_date_limit)
    const deletionQueue : Promise<any>[] = []

    // Raid Purge
    const raids = (await database.eventParticipationHistory.findMany({where: {serverId: config.server_id}}))
    .filter(i => i.eventDate.getTime() < monthAgo.getTime())

    for (let raid of raids){
        deletionQueue.push(database.eventParticipationHistory.delete({where: {id: raid.id}}))
    }

    // Support Purge
    const support = (await database.support.findMany({where: {serverId: config.server_id}}))
    .filter(i => i.date.getTime() < monthAgo.getTime())
    for (let supportEntry of support){
        deletionQueue.push(database.support.delete({where: {id: supportEntry.id}}))
    }

    // Await the deletionQueue completion
    await Promise.all(deletionQueue)

    // Return message
    await message.reply({content: messages.purge})
}