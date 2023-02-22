import { Message } from "discord.js";
import database from "../../functions/core/database";
import FeatureLock from "../../functions/features/featureLock";
import messages from "../../functions/models/messages";

export const Lock = new FeatureLock(async () => {
    return (await database.expressConfig.findMany())[0].expressLock
},
async (curr) => {
    await database.expressConfig.updateMany({data: {expressLock: curr}})
})

export default async function(message : Message){
    const locked = await Lock.toggle()

    return message.reply({content: 
        locked ?
        messages.lock_express :
        messages.unlock_express
    })
}