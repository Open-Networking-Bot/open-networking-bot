import {Message, TextChannel} from "discord.js";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";

export default async function (message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    const server = await client.guilds.fetch(config.server_id)
    const channel = await server.channels.fetch(config.raid_info_channel) as TextChannel

    const acceptedNames = ["omen", "phantom", "abyss", "shade", "spectre", "shadow"]
    if(!acceptedNames.some(i => content[2].toLowerCase() === i)) return message.reply(messages.not_a_raid_train)

    await message.react('✅')
    return channel.send((messages.raid_message as string).replace("%", content[2].toUpperCase()))
}