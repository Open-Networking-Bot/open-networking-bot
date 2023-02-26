import { Message } from "discord.js";
import database from "../../functions/core/database";
import { getTodaysSupportEntry } from "./supportQueries";
import { possibleMessage } from "./supportUpdating";

export async function New(message : Message){
    const content = message.mentions.members
    if(!content) return;

    {
        const member = await database.members.findFirst({where: {discordID: message.author.id}})
        if(!member) return;

        const entry = await getTodaysSupportEntry(member)
        await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport + content.size}})
    }
    
    {
        for(let memberRaw of content){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            const entry = await getTodaysSupportEntry(member)
            await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport + 1}})
        }
    }
}

export async function Updated(oldMessage : possibleMessage, newMessage : possibleMessage){
    const oldContent = oldMessage.mentions.members
    const content = newMessage.mentions.members
    if(!content) return;

    {
        const member = await database.members.findFirst({where: {discordID: newMessage.author!.id}})
        if(!member) return;

        const entry = await getTodaysSupportEntry(member)

        const amount = !!oldContent ? content.size - oldContent.size : content.size
        await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport + amount}})
    }

    if(!oldContent) return
    
    {
        const filtered = content.filter(i => !oldContent.some(x => x.id === i.id))

        for(let memberRaw of filtered){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            const entry = await getTodaysSupportEntry(member)
            await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport + 1}})
        }
    }

    {
        const filtered = oldContent.filter(i => !content.some(x => x.id === i.id))

        for(let memberRaw of filtered){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            const entry = await getTodaysSupportEntry(member)
            await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport - 1}})
        }
    }
}

export async function Deleted(message : possibleMessage){
    const content = message.mentions.members
    if(!content) return;

    {
        const member = await database.members.findFirst({where: {discordID: message.author!.id}})
        if(!member) return;

        const entry = await getTodaysSupportEntry(member)
        await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport - content.size}})
    }
    
    {
        for(let memberRaw of content){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            const entry = await getTodaysSupportEntry(member)
            await database.support.update({where: {id: entry.id}, data: {inviteSupport: entry.inviteSupport - 1}})
        }
    }
}