import { Message } from "discord.js";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import { DAY, WEEK } from "../../functions/core/magicNumbers";
import messages from "../../functions/models/messages";
import { Lock } from "./lockRequests";

export default async function(message : Message) {
    if(await Lock.isActive()) return

    const slot = parseInt(message.content)

    if(isNaN(slot)) return;
    if(slot > config.express_max_slots || slot < 1) return message.react('❓')

    const user = await database.members.findFirst({
        where: {discordID: message.author.id}
    })
    if(!user) return Promise.all([message.reply(messages.no_user_error), message.react('❌')])
    if(!user.url) return Promise.all([message.reply(messages.no_user_url_error_1st_person), message.react('❌')])
    
    const currentTimetable = await database.expressTimetable.findMany()
    const today = new Date().getTime()
    const dateOfExpressStart = (await database.expressConfig.findFirst())!.latestDate.getTime()

    if(
        ((today < dateOfExpressStart + DAY && user.lastExpressDate.getTime() > today - WEEK)|| !user.expressEligible)
    ) return message.react('❌')

    if(!message.member!.displayName.match(user.url)) return Promise.all([message.reply(messages.bad_username_to_url), message.react('❌')])
    

    for(let booking of currentTimetable)
        if(slot === booking.slot || booking.membersId === user.id) return message.react('❌')

    await database.expressTimetable.create({data: {membersId: user.id, slot: slot}})
    await database.members.update({where: {id: user.id}, data: {lastExpressDate: new Date()}})

    return message.react('✅')
}