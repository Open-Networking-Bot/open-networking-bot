import { Message } from "discord.js";
import helpCommands, { Command } from "../../functions/features/helpCommands"
import noCommand from "./noCommand";
import { hasNotGotRoles } from "../../functions/util/authenticate";

function createReply(commandName : string, commandDesc : string, fields : {name : string, value : string}[]){
    return [
        {
            "title": `Help for the "${commandName}" command`,
            "description": commandDesc,
            "color": 0x7300bf,
            "fields": fields
        }
    ]
}

export default async function (message : Message, content : string[]) {

    // Define a subroutine which creates a reply to the help message.
    const makeGenericHelpScreen = (command : Command, commandPrefix = "") =>
        message.reply({embeds: createReply(`$${commandPrefix}${command.name}`, command.desc, (()=>{
            const output : {name : string, value : string}[] = []
    
            if(command.args !== null) for(let i = 0; i < command.args.length; i++) output.push({name: command.args[i].name, value: command.args[i].desc})
    
            return output
        })())})

    // If the £help command is ran without an argument, it will show every root command in a menu.
    if(content.length < 2) {
        const root = helpCommands.getRoot()
        return message.reply({embeds: createReply("SSS Bot", "", (()=>{
            const output : {name : string, value : string}[] = []

            for(let command of root) if(command.access_level === null || !hasNotGotRoles(message, command.access_level)) output.push({name: command.name, value: command.desc})

            return output.sort((a, b) => a.name.localeCompare(b.name))
        })())})
    }

    // Attempt to get a command category
    const category = helpCommands.getCommandCategory(content[1])

    if(category){

        // Check if a subcommand was specified
        const command = (()=>{
            if(content.length < 3) return null

            for(let command of category.commands) if(command.name === content[2]) return command

            return null
        })()
        
        // If there was no subcommand, return a generic command category help message
        if(command === null) return message.reply({embeds: createReply(`$${category.name}`, category.desc, (()=>{
            const output : {name : string, value : string}[] = []

            for(let command of category.commands) if(command.access_level === null || !hasNotGotRoles(message, command.access_level)) output.push({name: command.name, value: command.desc})

            return output.sort((a, b) => a.name.localeCompare(b.name))
        })())})
        
        // If there was a subcommand, return the help menu for it
        return makeGenericHelpScreen(command, `${category.name} `)
    }

    // Get the command if there was no command category
    const command = helpCommands.getCommand(content[1], false)

    // If all else fails, give a "did you mean" screen
    if(command === null) return noCommand(message, content[1])

    // Return help for the command
    return makeGenericHelpScreen(command)

}