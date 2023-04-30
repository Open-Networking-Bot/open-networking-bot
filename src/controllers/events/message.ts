import {Message, TextChannel} from "discord.js";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";

/**
 * @author Lewis Page
 * @description Send a custom a message, for an event about to start. Invoked with `$event message`
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces
 * @returns A Message Sending Promise
 */
export default async function eventMessage(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    const server = await client.guilds.fetch(config.server_id)
    const channel = await server.channels.fetch(config.event_info_channel) as TextChannel

    const acceptedNames = ["lorem", "ipsum", "sor", "dolor", "amiet", "conscipsium"]
    if(!acceptedNames.some(i => content[2].toLowerCase() === i)) return message.reply(messages.not_a_event_train)

    await message.react('✅')
    return channel.send((messages.event_message as string).replace("%", content[2].toUpperCase()))
}