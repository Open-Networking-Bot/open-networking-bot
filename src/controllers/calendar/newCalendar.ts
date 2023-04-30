import { Message } from "discord.js";
import database from "../../functions/core/database"
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";

/**
 * @author Lewis Page
 * @description Creates a new calendar, when `$calendar new` is invoked
 * @param message The Discord Message
 * @returns A promise, containing the message reply
 */
export default async function newCalendar(message : Message) {
    // Delete the entire express timetable
    await database.calendarTimetable.deleteMany({where: {serverId: config.server_id}})

    // Set the express date in the database to today
    await database.calendarConfig.updateMany({where: {serverId: config.server_id}, data: {latestDate: new Date()}})

    // Return a success message
    await message.reply(messages.new_express)
}