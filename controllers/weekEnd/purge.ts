import {Message} from "discord.js";
import messages from "../../functions/models/messages";
import authenticate from "../../functions/util/authenticate";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import { AccessLevels } from "../../functions/models/accessLevels";

export default async function (message : Message){

    if(authenticate(message, AccessLevels.Council)) return;

    const monthAgo = new Date (new Date().getTime() - 86400000 * config.purge_date_limit)
    const deletionQueue : Promise<any>[] = []

    // Raid Purge
    const raids = (await database.raidParticipationHistory.findMany()).filter(i => i.raidDate.getTime() < monthAgo.getTime())
    for (let raid of raids){
        deletionQueue.push(database.raidParticipationHistory.delete({where: {id: raid.id}}))
    }

    // Support Purge
    const support = (await database.support.findMany()).filter(i => i.date.getTime() < monthAgo.getTime())
    for (let supportEntry of support){
        deletionQueue.push(database.support.delete({where: {id: supportEntry.id}}))
    }

    // Await the deletionQueue completion
    await Promise.all(deletionQueue)

    // Return message
    await message.reply({content: messages.purge})
}