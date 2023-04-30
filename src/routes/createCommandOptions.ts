import { GuildMember, Message } from "discord.js";
import helpCommandsObject, { Command, CommandCategory } from "../functions/features/helpCommands";
import convertIDsToGuildMembers from "../functions/util/convertIDsToGuildMembers";
import { pipeline } from "../functions/util/functionalPatterns";
import parseMentionedUser from "../functions/validation/parseMentionedUser";
import TextCommandOption, { keyValuePair } from "./models/TextCommandOption";

/**
 * @typedef
 * @author Lewis Page
 * @description The combined command, and the arguments given for it.
 */
type commandInfo = {
    command: Command,
    args: TextCommandOption
}

/**
 * @enum
 * @author Lewis Page
 * @description Represents the different types of errors that can come from the command system. Only represents client-side errors.
 */
export enum CommandOptionErrorResponse {
    NotEnoughArgs,
    NoCommandExists,
    InvalidMember
}

/**
 * @author Lewis Page
 * @description Creates a Text Command Option from a text-based command input. 
 * @param content The content of the message, split by spaces.
 * @param isCommandCategorized If the command being inputted is part of a command category.
 * @param command The command to extract the options for.
 * @returns The created `TextCommandOption` object or an Error Response.
 */
function createTextCommandOption(content : string[], isCommandCategorized : boolean, command : Command){
    if(!command.args) return new TextCommandOption([], [], [], [], []);

    const optionalArgs = command.args.filter(arg => arg.required === false)
    if(content.length - (isCommandCategorized ? 2 : 1) < command.args.length - optionalArgs.length) return CommandOptionErrorResponse.NotEnoughArgs;

    const members : keyValuePair<GuildMember>[] = []
    const numbers : keyValuePair<number>[] = []
    const integers : keyValuePair<number>[] = []
    const strings : keyValuePair<string>[] = []
    const booleans : keyValuePair<boolean>[] = []

    for (let i = 0; i < command.args.length; i++) {
        const arg = command.args[i];
        const contentArg = content[i + (isCommandCategorized ? 2 : 1)]
        
        switch(arg.type){
            case "MEMBER":
                const guildMember = pipeline([parseMentionedUser(contentArg)], convertIDsToGuildMembers) as GuildMember[]
                if(guildMember.length === 0) return CommandOptionErrorResponse.InvalidMember
                members.push({key: arg.name, val: guildMember[0]})
                break
            case "NUMBER":
                numbers.push({key: arg.name, val: +contentArg})
                break
            case "INTEGER":
                integers.push({key: arg.name, val: +contentArg})
                break
            case "STRING":
                strings.push({key: arg.name, val: contentArg})
                break
            case "BOOLEAN":
                booleans.push({key: arg.name, val: contentArg.toLowerCase() === "true" ? true : false})
                break
            default: throw new Error(`${command.id}'s argument, ${arg.name}, has an invalid type, being: ${arg.type}`)
        }
    }

    return new TextCommandOption(members, numbers, integers, strings, booleans)
}

/**
 * @author Lewis Page
 * @description Finds a command from a text-based input.
 * @param content The message content, split by spaces.
 * @returns The command as well as its arguments, or an Error Response.
 */
function findCommand(content : string[]) : commandInfo | CommandOptionErrorResponse {
    if(content.length < 1) return CommandOptionErrorResponse.NotEnoughArgs

    const commandRoot = helpCommandsObject.getRoot()
    for(let element of commandRoot){
        if(content[0].toLowerCase() !== element.name) continue;

        if(!(element as CommandCategory).commands){
            const args = createTextCommandOption(content, false, element as Command)
            if(args === CommandOptionErrorResponse.InvalidMember || args === CommandOptionErrorResponse.NotEnoughArgs) return args
            return {command: element as Command, args: args};
        } 
        
        if(content.length < 2) continue
        for(let subElement of (element as CommandCategory).commands){
            if(content[1].toLowerCase() === subElement.name){
                const args = createTextCommandOption(content, true, subElement as Command)
                if(args === CommandOptionErrorResponse.InvalidMember || args === CommandOptionErrorResponse.NotEnoughArgs) return args
                return {command: subElement as Command, args: args};
            } 
        }
    }

    return CommandOptionErrorResponse.NoCommandExists
}

/**
 * @author Lewis Page
 * @description Finds the information regarding a command, from a Discord Message.
 * @param message The Discord Message, sent.
 * @returns The command as well as its arguments, or an Error Response.
 */
export default function analyseCommand(message : Message){
    const content = message.content.slice(1).split(" ")
    return findCommand(content)
}