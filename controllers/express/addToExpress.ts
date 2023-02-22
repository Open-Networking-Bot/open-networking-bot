import { Message } from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database"
import { DAY, WEEK } from "../../functions/core/magicNumbers";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import { logMessage } from "../logging/loggingManager";

export default async function(message : Message, content : string[]) {
    if(await requireContentLengthOf(message, content, 4)) return

    const user = await database.members.findFirst({
        where: {discordID: parseMentionedUser(content[2])}
    })

    const slot = parseInt(content[3])

    if(isNaN(slot)) return message.reply(messages.not_a_number_slot)
    if(!user) return message.reply(messages.no_user)
    if(slot > config.express_max_slots || slot < 1) return message.reply(messages.not_a_slot)

    const currentTimetable = await database.expressTimetable.findMany()

    const forced = content.length !== 4 && content[4] === "force"

    const today = new Date().getTime()
    const dateOfExpressStart = (await database.expressConfig.findFirst())!.latestDate.getTime()

    if(
        ((today > dateOfExpressStart + DAY && user.lastExpressDate.getTime() > today - WEEK)
        || !user.expressEligible)
        && !forced
    ) return message.reply(messages.not_express_eligible)

    let needToCreateNewBooking = true
    for(let booking of currentTimetable)
        if(slot === booking.slot){
            if(!forced)
                return message.reply(messages.express_slot_taken)

            await database.expressTimetable.update({where: {id: booking.id}, data: { membersId: user.id }})
            needToCreateNewBooking = false
            break
        }
    
    if(needToCreateNewBooking)
        await database.expressTimetable.create({data: {membersId: user.id, slot: slot}})
    await database.members.update({where: {id: user.id}, data: {lastExpressDate: new Date()}})

    if(forced) logMessage(`${message.author.username} forcibly gave an express slot to ${user.name}`)
    return message.reply(messages.added_to_express)
}