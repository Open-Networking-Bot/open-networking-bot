import {Message} from "discord.js";
import authenticate from "../../functions/util/authenticate";
import { AccessLevels } from "../../functions/models/accessLevels";

/**
 * @deprecated
 * @author Lewis Page
 * @description Should restart the bot when the `$restart` command is invoked. However, the command instead serves an error message.
 * @param message The Discord Message, sent.
 * @returns A Message Reply Promise.
 */
export default async function restartBot(message : Message){
    if(authenticate(message, AccessLevels.Admin)) return;
    return message.reply("⚠️ This command has been depricated. Please use `$killit` and restart the bot manually.")
}