import { members } from "@prisma/client";
import { Collection, GuildMember, Message, PartialMessage } from "discord.js";
import database from "../../functions/core/database";
import parseSeveralMentionedUsers from "../../functions/validation/parseSeveralMentionedUsers";
import { newMessage } from "../misc/messageHandler";

export type possibleMessage = Message | PartialMessage
export type recordHandle = (member: members, amount : number) => Promise<void>
export type tagCalculation = (mentions : string[]) => number

const defaultTagCalculation : tagCalculation = (mentions : string[]) => mentions.length

export async function New(message : Message, handleRecord : recordHandle, calculateTags : tagCalculation = defaultTagCalculation){
    const content = parseSeveralMentionedUsers(message.content)
    if(content.length === 0) return;

    const member = await database.members.findFirst({where: {discordID: message.author.id}})
    if(!member) return;

    await handleRecord(member, calculateTags(content))
    newMessage(message.author)
}

export async function Updated(oldMessage : possibleMessage, newMessage : possibleMessage, handleRecord : recordHandle, calculateTags : tagCalculation = defaultTagCalculation){
    const oldContent = parseSeveralMentionedUsers(oldMessage.content!)
    const content = parseSeveralMentionedUsers(newMessage.content!)
    if(!content) return;

    const member = await database.members.findFirst({where: {discordID: newMessage.author!.id}})
    if(!member) return;

    await handleRecord(member, !!oldContent ? calculateTags(content) - calculateTags(oldContent) : calculateTags(content))
}

export async function Deleted(deletedMessage : possibleMessage, handleRecord : recordHandle, calculateTags : tagCalculation = defaultTagCalculation){
    const oldContent = parseSeveralMentionedUsers(deletedMessage.content!)
    if(!oldContent) return;

    const member = await database.members.findFirst({where: {discordID: deletedMessage.author!.id}})
    if(!member) return;

    handleRecord(member, calculateTags(oldContent))
}