import messages from "../../functions/models/messages";
import endWeek from "./endWeek";
import weekReview from "./weekReview";
import {Message} from "discord.js";

export default async function (message : Message, content : string[]){
    const numberOfWeeks = +content[2]
    if(isNaN(numberOfWeeks)) return  message.reply(messages.not_a_number_weeks)

    return endWeek(weekReview, {dateToStartFrom: new Date(), weeksToConsider: numberOfWeeks}, () => false, message)
}