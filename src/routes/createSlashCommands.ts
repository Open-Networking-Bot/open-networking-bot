import { ApplicationCommand, ApplicationCommandManager } from "discord.js";
import client from "../functions/core/serverInit";
import helpCommandsObject, { Command, CommandCategory } from "../functions/features/helpCommands";
import { curry } from "../functions/util/functionalPatterns";

/**
 * @author Lewis Page
 * @description Adds a new command to the bot.
 * @param commandsObject The bot's Command Manager.
 * @param command The command to be added to the bot.
 * @param commandCategory The category of command to add to the bot, where applicable.
 */
function createCommand(commandsObject : ApplicationCommandManager, command : Command, commandCategory : CommandCategory | null){
    commandsObject.create({
            name: !!commandCategory ? `${commandCategory.name}_${command.name}` : command.name,
            description: command.desc,
            
            options: !command.args ? [] : command.args.map(arg => {
                return {
                    name: arg.name,
                    description: arg.desc,
                    required: arg.required === false ? false : true,
                    type: arg.type
                } as any
            })
    })
}

/**
 * @author Lewis Page
 * @description Creates all the bot's commands when executed.
 */
export default async function createSlashCommands(){
    const commandsObject= client.application!.commands

    // await commandsObject.set([]) // Activate if a full command refresh is needed. Highly unstable.

    const create = curry(createCommand)(commandsObject)

    for(let command of helpCommandsObject.commands){
        await create(command)(null)
        console.log(`${command.name} initialized`)
    }
    

    for(let category of helpCommandsObject.command_categories)
        for(let command of category.commands){
            await create(command)(category)
            console.log(`${category.name} ${command.name} initialized`)
        }
    
}