import { GuildMember, User } from "discord.js"
import config from "../../functions/models/config"
import database from "../../functions/core/database"

interface SentMessage {
    id: string
    time: Date
}

let currentTimeBetweenSaves = 0
let messages : SentMessage[] = []

export const getMessageCache = () => messages

export async function saveMessageHistory() {
    const todo = []
    for(let message of messages){
        const task = database.members.updateMany({where: {discordID: message.id}, data: {lastMessage: message.time}})
        todo.push(task)
    }
    await database.$transaction(todo)
    messages = []
}

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