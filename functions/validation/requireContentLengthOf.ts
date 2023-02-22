import {Message} from "discord.js";
import messages from "../models/messages";

export default async function (message: Message, content: string[], neededLength : number){
    if(content.length < neededLength){
        await message.reply(messages.invalid_content_length)
        return true
    }
    return false
}