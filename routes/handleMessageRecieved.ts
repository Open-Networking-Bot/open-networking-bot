import { Interaction, Message } from "discord.js";
import { logMessage, logType } from "../controllers/logging/loggingManager"
import client from "../functions/core/serverInit"
import hackDetection from "../functions/features/hackDetection";
import config from "../functions/models/config";
import Monad from "../functions/models/Monad";
import routeCommand from "./commandRouting";

client.on("messageCreate", async (message) => {
    try {
        if(    message.content.length <= 0 
            || message.content[0] !== config.bot_command_character
            || !isNaN(+message.content.slice(1))
            || !(config.permitted_command_channels.some(ele => ele === message.channelId))
            || message.author.bot
            || message.author.system
            || !message.author.username
            || message.attachments.some(v => !!v.id)) return;
        
        if(await hackDetection(message)) return;
        routeCommand(new Monad<Interaction, Message>(undefined, message))
    }
    catch (err : any){
        await message.reply("⚠ An error has occurred- please contact lewisjet or a council member immediately.")
        logMessage(err as string, logType.critical)
    }
})