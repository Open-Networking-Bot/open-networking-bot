import { Message } from "discord.js";
import config from "../../functions/models/config";
import helpCommands, { IDescribable } from "../../functions/features/helpCommands";

/**
 * @author Lewis Page
 * @description handles if someone inputs an invalid command.
 * @param message The Discord Message, recieved.
 * @param content The Message content, split by spaces.
 * @param commandPrefix The prefix currently being used by commands.
 * @param scanningLocations What command categories to reference.
 * @param excludeNumbers If a command has a number in, for example `$24`, it should be ignored.
 * @returns A reply promise.
 */
export default async function noCommand(
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