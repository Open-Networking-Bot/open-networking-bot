import database from "../../functions/core/database";
import config from "../../functions/models/config";
import { logMessage, logType } from "../logging/loggingManager";

/**
 * @author Lewis Page
 * @description When the bot is turned on for the first time, all members are removed from NBR. This function does that.
 */
export default async function newBeenRaidedRecords() {
    const members = await database.members.findMany()
    
    await database.$transaction(members.filter(i => !!i.url).map(i => database.beenRaided.create({
        data: {
            url: i.url!,
            lastRaid: new Date(0),
            notes: "",
            serverId: config.server_id
        }
    })))

    await logMessage("The bot has finished clearing NBR from every member. Please restart the bot", logType.critical)
    process.exit(0)
}