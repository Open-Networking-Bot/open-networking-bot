import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import {TextChannel} from "discord.js";

/**
 * @author Lewis Page
 * @description Logs a message to the server's log channel.
 * @param message The message to send, without a full stop.
 * @param urgency The urgency level to send the message at.
 */
export async function logMessage(message : string, urgency : logType = logType.information){
    const loggingChannel = (await client.channels.fetch(config.logging_channel))! as TextChannel
    const severityCharacter = (()=>{ switch (urgency) {
        case logType.critical: return  `🧨`
        case logType.alert: return '❗'
        case logType.warning: return '⚠'
        default: return 'ℹ'
    }})()
    await loggingChannel.send({content: `${severityCharacter} Logged on <t:${Math.trunc(new Date().getTime() / 1000)}:f>: ${message}.`})
}

/**
 * @enum
 * @author Lewis Page
 * @description Shows what level of urgency a log has.
 */
export enum logType{
    /** Error has occurred */
    critical,

    /** User violation */
    alert,

    /** Something has not gone right */
    warning,

    /** 
     * General information 
     * @default 
     */
    information
}