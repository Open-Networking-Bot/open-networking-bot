import messages from "../../functions/models/messages";
import endWeek from "./endWeek";
import weekReview from "./weekReview";
import {Message} from "discord.js";

/**
 * @author Lewis Page
 * @description Creates an activity report with a custom amount of weeks. Invoked with the `$week custom` command.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise
 */
export default async function weekCustom(message : Message, content : string[]){
    const numberOfWeeks = +content[2]
    if(isNaN(numberOfWeeks)) return message.reply(messages.not_a_number_weeks)

    return endWeek(weekReview, {dateToStartFrom: new Date(), weeksToConsider: numberOfWeeks}, () => false, message)
}