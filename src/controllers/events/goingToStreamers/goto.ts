import {Message, TextChannel} from "discord.js";
import requireContentLengthOf from "../../../functions/validation/requireContentLengthOf";
import client from "../../../functions/core/serverInit";
import config from "../../../functions/models/config"
import updateBeenRaidedRecord from "./updateBeenRaidedRecord"
import parseIntoTwitchURL from "../../../functions/validation/parseIntoTwitchURL"
import messages from "../../../functions/models/messages";

/**
 * @author Lewis Page
 * @description Displays a Twitch URL in the correct event channel, when `$event goto` is run.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function eventGoto(message: Message, content : string[]){

    // If the message is shorter than 1 argument, return an error
    if(await requireContentLengthOf(message, content, 3)) return;

    const parsedPersonToRaid = await parseIntoTwitchURL(content[2].toLowerCase())

    if(parsedPersonToRaid.IsError()) return message.reply((parsedPersonToRaid.Monad as Error).message)

    // Update record
    const beenRaidedRecord = await updateBeenRaidedRecord(parsedPersonToRaid.Monad as string)

    // Create raid link
    await (client.channels.cache.get(config.event_links_channel) as TextChannel).send
    (`https://www.twitch.tv/${beenRaidedRecord.url} ${beenRaidedRecord.notes}`)

    return message.reply(messages.raid_goto_confirmation + ` <#${config.event_links_channel}>`)
}