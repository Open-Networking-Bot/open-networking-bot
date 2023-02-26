import {CommandInteraction, GuildMember, Message} from "discord.js";
import { AccessLevelNumberToPermittedIDs } from "../models/accessLevels";
import messages from "../models/messages";

export default function (message : Message | CommandInteraction, roles : number){
    if(hasNotGotRoles(message, roles)) {
        message.reply({content: messages.no_permission}).then().catch(err => console.error(err))
        return true
    }
    return false
}

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