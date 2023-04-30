import { Message } from "discord.js";
import database from "../../functions/core/database";
import { possibleMessage } from "./supportUpdating";
import addSupport from "./addSupport";
import { SupportTypes } from "../../functions/models/supportTypes";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Handles a new invite support message being sent.
 * @param message The Discord Message, sent by the member.
 */
export async function New(message : Message){
    const content = message.mentions.members
    if(!content) return;

    {
        const member = await database.members.findFirst({where: {discordID: message.author.id, serverId: config.server_id}})
        if(!member) return;

        await addSupport(SupportTypes.invite, content.size, member.id)
    }
    
    {
        for(let memberRaw of content){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id, serverId: config.server_id}})
            if(!member) return;

            await addSupport(SupportTypes.invite, 1, member.id)
        }
    }
}

/**
 * @author Lewis Page
 * @description Handles an invite support message being updated.
 * @param oldMessage The old Discord Message, sent by the member.
 * @param newMessage The new Discord Message, sent by the member.
 */
export async function Updated(oldMessage : possibleMessage, newMessage : possibleMessage){
    const oldContent = oldMessage.mentions.members
    const content = newMessage.mentions.members
    if(!content) return;

    {
        const member = await database.members.findFirst({where: {discordID: newMessage.author!.id, serverId: config.server_id}})
        if(!member) return;

        const amount = !!oldContent ? content.size - oldContent.size : content.size
        await addSupport(SupportTypes.invite, amount, member.id)
    }

    if(!oldContent) return
    
    {
        const filtered = content.filter(i => !oldContent.some(x => x.id === i.id))

        for(let memberRaw of filtered){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            await addSupport(SupportTypes.invite, 1, member.id)
        }
    }

    {
        const filtered = oldContent.filter(i => !content.some(x => x.id === i.id))

        for(let memberRaw of filtered){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            await addSupport(SupportTypes.invite, -1, member.id)
        }
    }
}

/**
 * @author Lewis Page
 * @description Handles a new invite support message being deleted.
 * @param message The Discord Message, deleted by the member.
 */
export async function Deleted(message : possibleMessage){
    const content = message.mentions.members
    if(!content) return;

    {
        const member = await database.members.findFirst({where: {discordID: message.author!.id}})
        if(!member) return;

        await addSupport(SupportTypes.invite, content.size * -1, member.id)
    }
    
    {
        for(let memberRaw of content){
            const member = await database.members.findFirst({where: {discordID: memberRaw[1].id}})
            if(!member) return;

            await addSupport(SupportTypes.invite, -1, member.id)
        }
    }
}