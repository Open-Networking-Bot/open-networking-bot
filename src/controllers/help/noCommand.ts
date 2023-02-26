import { Message } from "discord.js";
import config from "../../functions/models/config";
import helpCommands, { IDescribable } from "../../functions/features/helpCommands";

export default async function (
        message : Message,
        content : string, 
        commandPrefix = config.bot_command_character, 
        scanningLocations : IDescribable[][] | null = [helpCommands.command_categories, helpCommands.commands], 
        excludeNumbers = true) {
    if(excludeNumbers && !isNaN(parseFloat(content))) return;

    const matches = helpCommands.getSimilarCommands(content, 1, scanningLocations)

    let output = "⚠️ The command inputted does not exist. Did you mean: "
    matches.forEach(i => output += `\`${commandPrefix}${i.name}\`;`)
    output = output.slice(0, -1)
    output += "?"
    return message.reply(output)
}