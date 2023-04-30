import {Message} from "discord.js";
import messages from "../models/messages";

/**
 * @author Lewis Page
 * @description Tests a Discord Message to see if it has enough arguments to be of a valid length. Returns an error message to the user if not.
 * @param message The Discord Message, sent.
 * @param content The Message Content, seperated by spaces.
 * @param neededLength The required array length that the content needs to be.
 * @returns Wether an error message was sent or not.
 */
export default async function requireContentLengthOf(message: Message, content: string[], neededLength : number){
    if(content.length < neededLength){
        await message.reply(messages.invalid_content_length)
        return true
    }
    return false
}