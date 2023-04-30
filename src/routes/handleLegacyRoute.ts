import { CommandInteraction, GuildMember, Interaction, Message } from "discord.js";
import { Command, CommandCategory } from "../functions/features/helpCommands";
import Monad from "../functions/models/Monad";
import AbstractedCommand from "./models/AbstractedCommand";
import { legacyCallback } from "./models/commandCallbackTypes";
import LegacyCommandAbstraction from "./models/LegacyCommandAbstraction";

/**
 * @author Lewis Page
 * @description If a command is deemed to be legacy, `handleLegacyRoute` allows the command to be ran, even as a slash command.
 * @param controller The Legacy Command Controller.
 * @param abstractedCommand The information related to the command, being ran.
 * @param route How the command was executed in the first place.
 * @param command The command, executed.
 * @param potentialComamndCategory If the command was in a category, the command category it belongs to.
 * @returns The controller's execution promise.
 */
export default function handleLegacyRoute(controller : legacyCallback,
     abstractedCommand : AbstractedCommand,
      route : Monad<Interaction, Message>,
       command : Command,
        potentialComamndCategory : CommandCategory | null){

    let content : string = ""
    route.handle(
        // Handle Interactions
        interaction => {
            content += "$"

            if(!!potentialComamndCategory) content += `${potentialComamndCategory.name} `
            content += `${command.name}`

            if(!command.args) return

            for(let arg of command.args){
                const contents = (interaction as CommandInteraction).options.get(arg.name)
                if(!contents) continue
                content += ` ${(!!contents.member ? (contents.member as GuildMember).user.id : contents.value!.toString())}`
            }
        },

        // Handle Messages
        message => {
            content = message.content
        }
    )

    const legacyCommandAbstraction : LegacyCommandAbstraction = {
        ...abstractedCommand,
        content: content
    }

    //@ts-ignore
    return controller(legacyCommandAbstraction, content.slice(1).split(" "))
}