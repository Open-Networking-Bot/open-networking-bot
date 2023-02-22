import database from "../../functions/core/database";
import { logMessage, logType } from "../logging/loggingManager";

export default async function() {
    const members = await database.members.findMany()
    
    await database.$transaction(members.filter(i => !!i.url).map(i => database.beenRaided.create({
        data: {
            url: i.url!,
            lastRaid: new Date(0),
            notes: ""
        }
    })))

    await logMessage("The bot has finished clearing NBR from every member. Please restart the bot", logType.critical)
    process.exit(0)
}