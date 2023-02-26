import { ApplicationCommand, ApplicationCommandManager } from "discord.js";
import client from "../functions/core/serverInit";
import helpCommandsObject, { Command, CommandCategory } from "../functions/features/helpCommands";
import { curry } from "../functions/util/functionalPatterns";

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

export default async function createSlashCommands(){
    const commandsObject= client.application!.commands
    //await commandsObject.set([])

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