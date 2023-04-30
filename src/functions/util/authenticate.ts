import {CommandInteraction, GuildMember, Message} from "discord.js";
import { AccessLevelNumberToPermittedIDs } from "../models/accessLevels";
import messages from "../models/messages";

/**
 * @author Lewis Page
 * @description Checks if a member is permitted to run a command. If they are not, a reply is sent to them saying that they are not permitted to run the command.
 * @param message The Discord Message or Command Interaction, Given.
 * @param roles The Access Levels permitted for the command to be run.
 * @returns If the member is allowed to run the command.
 */
export default function authenticate(message : Message | CommandInteraction, roles : number){
    if(hasNotGotRoles(message, roles)) {
        message.reply({content: messages.no_permission}).then().catch(err => console.error(err))
        return true
    }
    return false
}

/**
 * @author Lewis Page
 * @description Checks if a message or command interaction, sent, has the authority to run the command.
 * @param message The Discord Message or Command Interaction, Given. 
 * @param roles The Access Levels permitted for the command to be run.
 * @returns If the Discord Member can be authenticated to run the command.
 */
export function hasNotGotRoles(message : Message | CommandInteraction, roles : number){
    return !message.member || !(message.member! as GuildMember).roles.cache.some(role => {
        for (let i of AccessLevelNumberToPermittedIDs(roles)){
            if (role.id == i){
                return true
            }
        }
        return false
    })
}