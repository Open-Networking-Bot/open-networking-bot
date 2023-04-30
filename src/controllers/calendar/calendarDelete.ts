import { Message } from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";

/**
 * @author Lewis Page
 * @description Removes a slot from the calendar, when the `$calendar delete` command is invoked.
 * @param message The Discord Message
 * @param content The Message's content, split by spaces.
 * @returns A message reply promise
 */
export default async function calendarDelete(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    const slot = parseInt(content[2])
    if(isNaN(slot)) return message.reply(messages.not_a_number_slot)
    if(slot > config.calendar_max_slots || slot < 1) return message.reply(messages.not_a_slot)
    
    const deleted = await (await database.calendarTimetable.deleteMany({where: {slot: slot, serverId: config.server_id}})).count
    if(deleted === 0) return message.reply(messages.slot_not_taken)

    return message.reply(messages.deleted_slot)
}