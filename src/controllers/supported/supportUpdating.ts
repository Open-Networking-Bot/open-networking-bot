import { members } from "@prisma/client";
import { Message, PartialMessage } from "discord.js";
import database from "../../functions/core/database";
import parseSeveralMentionedUsers from "../../functions/validation/parseSeveralMentionedUsers";
import { newMessage } from "../misc/messageHandler";
import config from "../../functions/models/config";

export type possibleMessage = Message | PartialMessage
export type recordHandle = (member: members, amount : number) => Promise<void>
export type tagCalculation = (mentions : string[]) => number

const defaultTagCalculation : tagCalculation = (mentions : string[]) => mentions.length

/**
 * @author Lewis Page
 * @description Handles when a new support message is created.
 * @param message The Discord Message, sent.
 * @param handleRecord The handle used to add points.
 * @param calculateTags The algorithm to calculate how many tags there are.
 */
export async function New(message : Message, handleRecord : recordHandle, calculateTags : tagCalculation = defaultTagCalculation){
    const content = parseSeveralMentionedUsers(message.content)
    if(content.length === 0) return;

    const member = await database.members.findFirst({where: {discordID: message.author.id, serverId: config.server_id}})
    if(!member) return;

    await handleRecord(member, calculateTags(content))
    newMessage(message.author)
}

/**
 * @author Lewis Page
 * @description Handles when a support message is updated.
 * @param oldMessage The old Discord Message, sent.
 * @param newMessage The new Discord Message, sent.
 * @param handleRecord The handle used to add/remove points.
 * @param calculateTags The algorithm to calculate how many tags there are.
 */
export async function Updated(oldMessage : possibleMessage, newMessage : possibleMessage, handleRecord : recordHandle, calculateTags : tagCalculation = defaultTagCalculation){
    const oldContent = parseSeveralMentionedUsers(oldMessage.content!)
    const content = parseSeveralMentionedUsers(newMessage.content!)
    if(!content) return;

    const member = await database.members.findFirst({where: {discordID: newMessage.author!.id, serverId: config.server_id}})
    if(!member) return;

    await handleRecord(member, !!oldContent ? calculateTags(content) - calculateTags(oldContent) : calculateTags(content))
}

/**
 * @author Lewis Page
 * @description Handles when a support message is deleted.
 * @param message The Discord Message, deleted.
 * @param handleRecord The handle used to remove points.
 * @param calculateTags The algorithm to calculate how many tags used to be.
 */
export async function Deleted(deletedMessage : possibleMessage, handleRecord : recordHandle, calculateTags : tagCalculation = defaultTagCalculation){
    const oldContent = parseSeveralMentionedUsers(deletedMessage.content!)
    if(!oldContent) return;

    const member = await database.members.findFirst({where: {discordID: deletedMessage.author!.id, serverId: config.server_id}})
    if(!member) return;

    handleRecord(member, calculateTags(oldContent))
}