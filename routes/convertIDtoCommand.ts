import helpCommandsObject, { Command, CommandCategory } from "../functions/features/helpCommands";
import { CommandOptionErrorResponse } from "./createCommandOptions";

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