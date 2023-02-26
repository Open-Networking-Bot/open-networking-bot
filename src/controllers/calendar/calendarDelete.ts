import { Message } from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";

export default async function(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    const slot = parseInt(content[2])
    if(isNaN(slot)) return message.reply(messages.not_a_number_slot)
    if(slot > config.express_max_slots || slot < 1) return message.reply(messages.not_a_slot)
    
    const deleted = await (await database.expressTimetable.deleteMany({where: {slot: slot}})).count
    if(deleted === 0) return message.reply(messages.slot_not_taken)

    return message.reply(messages.deleted_slot)
}