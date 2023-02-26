import {Message, TextChannel} from "discord.js";
import requireContentLengthOf from "../../../functions/validation/requireContentLengthOf";
import client from "../../../functions/core/serverInit";
import config from "../../../functions/models/config"
import updateBeenRaidedRecord from "./updateBeenRaidedRecord"
import parseIntoTwitchURL from "../../../functions/validation/parseIntoTwitchURL"
import messages from "../../../functions/models/messages";
import sanitiseMarkdown from "../../../functions/validation/sanitiseMarkdown";

export default async function (message: Message, content : string[]){

    // If the message is shorter than 1 argument, return an error
    if(await requireContentLengthOf(message, content, 3)) return;

    const parsedPersonToRaid = await parseIntoTwitchURL(content[2].toLowerCase())

    if(parsedPersonToRaid.IsError()) return message.reply((parsedPersonToRaid.Monad as Error).message)

    // Update record
    const beenRaidedRecord = await updateBeenRaidedRecord(parsedPersonToRaid.Monad as string)

    // Create raid link
    await (client.channels.cache.get(config.raid_links_channel) as TextChannel).send
    (`https://www.twitch.tv/${beenRaidedRecord.url} ${beenRaidedRecord.notes}`)

    return message.reply(messages.raid_goto_confirmation + ` <#${config.raid_links_channel}>`)
}