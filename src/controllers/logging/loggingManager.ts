import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import {TextChannel} from "discord.js";

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

export enum logType{
    critical, // Error has occurred
    alert, // User violation
    warning, // Something has not gone right
    information // General information
}