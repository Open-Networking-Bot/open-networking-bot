import {Message} from "discord.js";
import requireContentLengthOf from "../../../functions/validation/requireContentLengthOf";
import updateBeenRaidedRecord from "./updateBeenRaidedRecord";
import messages from "../../../functions/models/messages";
import parseIntoTwitchURL from "../../../functions/validation/parseIntoTwitchURL";


/**
 * @author Lewis Page
 * @description Logs a member as visited on an event, when `$event visited` is invoked.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function eventVisited(message: Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    const parsedPersonToRaid = await parseIntoTwitchURL(content[2].toLowerCase())

    if(parsedPersonToRaid.IsError()) return message.reply((parsedPersonToRaid.Monad as Error).message)

    await updateBeenRaidedRecord(parsedPersonToRaid.Monad as string)

    // Return Response
    return message.reply({content: messages.person_visited})
}