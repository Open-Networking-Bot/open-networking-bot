import { Message } from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import { DAY, WEEK } from "../../functions/core/magicNumbers";
import messages from "../../functions/models/messages";
import { Lock } from "./lockRequests";

/**
 * @author Lewis Page
 * @description Adds a member to the Calendar Event, when a slot is requested
 * @param message The Discord Message
 * @returns A message reply promise
 */
export default async function addToCalendarAutomatic(message : Message) {
    if(await Lock.isActive()) return;

    const slot = parseInt(message.content)

    if(isNaN(slot)) return;
    if(slot > config.calendar_max_slots || slot < 1) return message.react('❓')

    const user = await database.members.findFirst({
        where: {discordID: message.author.id, serverId: config.server_id}
    })
    if(!user) return Promise.all([message.reply(messages.no_user_error), message.react('❌')])
    if(!user.url) return Promise.all([message.reply(messages.no_user_url_error_1st_person), message.react('❌')])
    
    const currentTimetable = await database.calendarTimetable.findMany({where: {serverId: config.server_id}})
    const today = new Date().getTime()
    const dateOfCalendarStart = (await database.calendarConfig.findFirst({where: {serverId: config.server_id}}))!
                                .latestDate.getTime()

    if(
        ((today < dateOfCalendarStart + DAY && user.lastCalendarDate.getTime() > today - WEEK)|| !user.eventEligible)
    ) return message.react('❌')

    if(!message.member!.displayName.match(user.url)) return Promise.all([message.reply(messages.bad_username_to_url), message.react('❌')])
    

    for(let booking of currentTimetable)
        if(slot === booking.slot || booking.membersId === user.id) return message.react('❌')

    await database.calendarTimetable.create({data: {membersId: user.id, slot: slot, serverId: config.server_id}})
    await database.members.update({where: {id: user.id}, data: {lastCalendarDate: new Date()}})

    return message.react('✅')
}