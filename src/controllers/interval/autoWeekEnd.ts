import { TextChannel } from "discord.js";
import config from "../../functions/models/config";
import findLastMonday from "../../functions/features/findLastMonday";
import { IntervalInstance } from "../../functions/core/IntervalManager";
import { AUTO_WEEK_END } from "../../functions/core/intervalNames";
import { MINUTE } from "../../functions/core/magicNumbers";
import client from "../../functions/core/serverInit";
import { endWeekLogic } from "../weekEnd/endWeek";
import weekEnd, { weekEndOnLeaveHandler } from "../weekEnd/weekEnd";

export default {
    name: AUTO_WEEK_END,
    interval: setInterval(async ()=>{
        const time = new Date()
        const isMonday = time.getDay() === 1
        const isCorrectHour = time.getHours() === 0
        const isInTimeRange = time.getMinutes() < 30 && time.getMinutes() >= 15

        if(isMonday && isCorrectHour && isInTimeRange) {
            const file = await endWeekLogic(weekEnd, {dateToStartFrom: findLastMonday(), weeksToConsider: 1}, weekEndOnLeaveHandler)
            const server = await client.guilds.fetch(config.server_id)
            const channel = await server.channels.fetch(config.report_channel) as TextChannel
            await channel.send({files: [file]})
        }
    }, MINUTE * 15)
} as IntervalInstance