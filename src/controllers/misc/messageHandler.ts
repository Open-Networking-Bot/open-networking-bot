import { GuildMember, User } from "discord.js"
import config from "../../functions/models/config"
import database from "../../functions/core/database"

/**
 * @interface
 * @author Lewis Page
 * @description Holds a message's author and when the message was sent.
 */
interface SentMessage {
    id: string
    time: Date
}

let currentTimeBetweenSaves = 0
let messages : SentMessage[] = []

/**
 * @author Lewis Page
 * @description Returns what messages the bot has yet to process.
 * @returns The messages, currently cached.
 */
export const getMessageCache = () => messages

/**
 * @author Lewis Page
 * @description Clears the message cache, and updates each member in the database in accordance with what messages they sent.
 */
export async function saveMessageHistory() {
    const todo = []
    for(let message of messages){
        const task = database.members.updateMany({where: {discordID: message.id, serverId: config.server_id}, data: {lastMessage: message.time}})
        todo.push(task)
    }
    await database.$transaction(todo)
    messages = []
}

/**
 * @author Lewis Page
 * @description Handles new messages being sent to the Discord Server, and their addition to the message cache.
 * @param sender Who sent the Discord Message
 */
export async function newMessage(sender : GuildMember | User){
    messages.push({
        id: sender.id,
        time: new Date()
    })
    currentTimeBetweenSaves++

    if(currentTimeBetweenSaves === config.time_between_message_history_save){
        currentTimeBetweenSaves = 0
        await saveMessageHistory()
    }
}