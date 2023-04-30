import helpCommandsObject, { Command, CommandCategory } from "../functions/features/helpCommands";
import { CommandOptionErrorResponse } from "./createCommandOptions";

/**
 * @author Lewis Page
 * @description Converts a Command ID to a `Command` iterface, or an error response.
 * @param id The ID to convert.
 * @returns Either an error response, stating why the function failed, or the command relating the the ID, given.
 */
export default function convertIDtoCommand(id : string) : Command | CommandOptionErrorResponse{
    const root = helpCommandsObject.getRoot()

    for(let command of root){
        if(!!(command as CommandCategory).commands){
            for(let subcommand of (command as CommandCategory).commands){
                if(`${command.id}_${subcommand.id}` === id) return subcommand
            }
        }
        else if(command.id === id) return command as Command
    }

    return CommandOptionErrorResponse.NoCommandExists
}