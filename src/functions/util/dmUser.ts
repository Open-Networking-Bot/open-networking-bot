import {GuildMember, Message, MessageOptions, MessagePayload} from "discord.js";
import {logMessage, logType} from "../../controllers/logging/loggingManager";
import messages from "../models/messages";

/**
 * @author Lewis Page
 * @description Handles the logic and validation for DMing a user. 
 * @param member The GuildMember to DM.
 * @param content The message to DM.
 * @param message The Discord Message, being the reason for the DM.
 */
export default async function dmUser(member: GuildMember, content: string | MessagePayload | MessageOptions, message: Message | undefined = undefined) {
    try {
        const dm = await member.createDM()
        await dm.send(content)
        if(message) await message.react('✅')
    }
    catch(e){
        const promises : Promise<any>[] = [logMessage(`${member.user.username} can not be DMed`, logType.warning)]
        if(message) promises.push(message.reply({content: messages.cant_send_dm}))
        await Promise.all(promises)
    }
}