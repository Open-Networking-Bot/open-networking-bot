import { Message } from "discord.js";
import database from "../../functions/core/database"
import messages from "../../functions/models/messages";

export default async function(message : Message) {
    // Delete the entire express timetable
    await database.expressTimetable.deleteMany()

    // Set the express date in the database to today
    await database.expressConfig.updateMany({data: {latestDate: new Date()}})

    // Return a success message
    await message.reply(messages.new_express)
}