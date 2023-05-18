import {GuildMember, Message} from "discord.js";
import config from "../../functions/models/config";
import client from "../../functions/core/serverInit";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import validator from "validator";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import database from "../../functions/core/database";
import autocorrectURLChange from "../../functions/features/autocorrectURLChange";

/**
 * @author Lewis Page
 * @description Creates a new database entry for the server member. Gives them the new member role.
 * @param newMember The Guild Member to initialise.
 */
export async function newMemberAuto(newMember : GuildMember){
    await database.members.create({ data: { 
        name: newMember.user.username,
        discordID: newMember.user.id,
        weeksOfInactivity: 0,
        serverId: config.server_id
    } })
    await newMember.roles.add(config.new_member_role)
}

/**
 * @author Lewis Page
 * @description Adds a member to the database. Controller for `$user add`
 * @param message The discord message, sent
 * @param content message.content, split by spaces
 * @returns the message response promise
 */
export async function newMemberManual(message : Message<boolean>, content : string[]){
    if(await requireContentLengthOf(message, content, 4)) return;

    const newMember = client.users.cache.get(content[2])
    const url = (content[3][0] === '<' ? content[3].slice(1,content[3].length - 1) : content[3])
    if(validator.isURL(url)){
        return message.reply({content: messages.should_not_be_a_url})
    }

    if(!newMember){
        return  message.reply(messages.no_user)
    }

    await database.members.create({data: {
        name: newMember.username, 
        discordID: newMember.id, 
        weeksOfInactivity: 0, 
        url: url.toLowerCase(),
        serverId: config.server_id
    }})
    return message.reply(messages.manual_user_addition)
}

/**
 * @author Lewis Page
 * @description Connects the member's Twitch account to the database. Controller for `$user init`
 * @param message The discord message, sent
 * @param content message.content, split by spaces
 * @returns the message response promise
 */
export async function memberInit(message : Message<boolean>, content : string[]){
    if(await requireContentLengthOf(message, content, 4)) return;

    const url = (content[3][0] === '<' ? content[3].slice(1,content[3].length - 1) : content[3])
    if(validator.isURL(url)){
        return message.reply({content: messages.should_not_be_a_url})
    }

    const usr = await database.members.findFirst({where: {discordID: content[2], serverId: config.server_id }})
    const oldUrl = !!usr ? usr.url : null
    if(!usr){
        return message.reply({content: messages.no_user})
    }

    await database.members.updateMany({
        where: {
            discordID: parseMentionedUser(content[2]),
            serverId: config.server_id
        },
        data: { url: url.toLowerCase() }
    })
    
    if(!!oldUrl) await autocorrectURLChange(oldUrl, url.toLowerCase()) 

    return message.reply(messages.manual_url_addition)
}

/**
 * @author Lewis Page
 * @description Connects your Twitch account to the SSS's database. Controller for `$link`
 * @param message The discord message, sent
 * @param content message.content, split by spaces
 * @returns the message response promise
 */
export async function memberLink(message : Message<boolean>, content : string[]){
    if(await requireContentLengthOf(message, content, 2)) return;

    const url = (content[1][0] === '<' ? content[1].slice(1,content[1].length - 1) : content[1])
    if(validator.isURL(url)){
        return message.reply({content: messages.should_not_be_a_url})
    }

    const usr = await database.members.findFirst({where: {discordID: message.author.id, serverId: config.server_id}})
    const oldUrl = !!usr ? usr.url : null
    if(!usr){
        return message.reply({content: messages.no_user_error})
    }

    await database.members.updateMany({
        where: {
            discordID: message.author.id,
            serverId: config.server_id
        },
        data: { url: url.toLowerCase() }
    })
    
    if(!!oldUrl) await autocorrectURLChange(oldUrl, url.toLowerCase()) 

    return message.react('✅')
}