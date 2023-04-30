import config from "../../functions/models/config";
import database from "../../functions/core/database";
import client from "../../functions/core/serverInit";
import { logMessage, logType } from "../logging/loggingManager";

/**
 * @author Lewis Page
 * @description When the server is first started, each member will be added to the database. This function does that.
 */
export default async function newServer() {
    const members = (await client.guilds.fetch(config.server_id)).members
    
    await database.$transaction(members.cache.filter(member => !member.user.bot).map(member => database.members.create({
        data: {
            discordID: member.id,
            name: member.user.username,
            weeksOfInactivity: 0,
            serverId: config.server_id
        }
    })))

    await logMessage("The bot has finished its first time setup. Please restart the bot", logType.critical)
    process.exit(0)
}