import {Message} from "discord.js";
import messages from "../../functions/models/messages";
import authenticate from "../../functions/util/authenticate";
import { logMessage, logType } from "../logging/loggingManager";
import { AccessLevels } from "../../functions/models/accessLevels";

export default async function (message : Message){
    if(authenticate(message, AccessLevels.Council)) return;

    await Promise.all([message.reply({ content: messages.shutdown}), logMessage("The server was shutdown with the `$killit` command", logType.critical)])
    process.exit()
}