import { Message } from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database"
import { DAY, WEEK } from "../../functions/core/magicNumbers";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import { logMessage } from "../logging/loggingManager";

/**
 * @author Lewis Page
 * @description Adds a member to the Calendar Event, when the `$calendar add` command is triggered
 * @param message The Discord Message
 * @param content The Message's content, split by spaces.
 * @returns A message reply promise
 */
export default async function addToCalendar(message : Message, content : string[]) {
    if(await requireContentLengthOf(message, content, 4)) return

    const user = await database.members.findFirst({
        where: {discordID: parseMentionedUser(content[2]), serverId: config.server_id}
    })

    const slot = parseInt(content[3])

    if(isNaN(slot)) return message.reply(messages.not_a_number_slot)
    if(!user) return message.reply(messages.no_user)
    if(slot > config.calendar_max_slots || slot < 1) return message.reply(messages.not_a_slot)

    const currentTimetable = await database.calendarTimetable.findMany({where: {serverId: config.server_id}})

    const forced = content.length !== 4 && content[4] === "force"

    const today = new Date().getTime()
    const dateOfExpressStart = (await database.calendarConfig.findFirst({where: {serverId: config.server_id}}))!
                                .latestDate.getTime()

    if(
        ((today > dateOfExpressStart + DAY && user.lastCalendarDate.getTime() > today - WEEK)
        || !user.eventEligible)
        && !forced
    ) return message.reply(messages.not_calendar_eligible)

    let needToCreateNewBooking = true
    for(let booking of currentTimetable)
        if(slot === booking.slot){
            if(!forced)
                return message.reply(messages.calendar_slot_taken)

            await database.calendarTimetable.update({where: {id: booking.id}, data: { membersId: user.id }})
            needToCreateNewBooking = false
            break
        }
    
    if(needToCreateNewBooking)
        await database.calendarTimetable.create({data: {membersId: user.id, slot: slot, serverId: config.server_id}})
    await database.members.update({where: {id: user.id}, data: {lastCalendarDate: new Date()}})

    if(forced) logMessage(`${message.author.username} forcibly gave a calendar slot to ${user.name}`)
    return message.reply(messages.added_to_calendar)
}