import {Message} from "discord.js";
import messages from "../../functions/models/messages";
import authenticate from "../../functions/util/authenticate";
import { logMessage, logType } from "../logging/loggingManager";
import { AccessLevels } from "../../functions/models/accessLevels";
/**
 * @author Lewis Page
 * @description Safely exits the Discord Bot, when a command is invoked
 * @param message The Discord Message, sent
 */
export default async function killBot(message : Message){
    if(authenticate(message, AccessLevels.Admin)) return;

    await Promise.all([message.reply({ content: messages.shutdown}), logMessage("The server was shutdown with the `$killit` command", logType.critical)])
    process.exit()
}