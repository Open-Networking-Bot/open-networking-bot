import {Message, TextChannel} from "discord.js";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import client from "../../functions/core/serverInit";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import {members} from "@prisma/client"
import database from "../../functions/core/database";
import parseIntoTwitchURL from "../../functions/validation/parseIntoTwitchURL";
import eligiblity from "./eligiblity";

/**
 * @author Lewis Page
 * @description Finds a user in the database, from the information given from the user. Gives an error reply if a user isn't found.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns The found user, or null
 */
const findUser = async (message: Message, content: string[])=>{
    // Get targeted user
    let user : members | null
    if(content.length >= 4){
        user = await database.members.findFirst({where: {discordID: parseMentionedUser(content[3]), serverId: config.server_id}})
        if(!user){
            await message.reply({content: messages.no_user})
            return null;
        }
    }
    else{
        user = await database.members.findFirst({where: {discordID: message.author.id, serverId: config.server_id}})
        if(!user){
            await message.reply({content: messages.no_user_error})
            return null;
        }
    }

    return user
}

/**
 * @author Lewis Page
 * @description Gathers the history of when a member last participated in an event. Invoked with `$event history attendance`
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export async function eventAttendanceHistory(message: Message, content: string[]){

    const user = await findUser(message,content)

    if(!user) return;

    // Get the user's raid history
    const raids = await database.eventParticipationHistory.findMany({where: {membersId: user.id, serverId: config.server_id}})

    // Create output
    let output = ""

    for (let raid of raids){
        const newString = `- Raid on <t:${Math.floor(raid.eventDate.getTime() / 1000)}:F>: (${raid.pointsAwarded} points)\n`
        if(newString.length + output.length > 2000){
            break;
        }
        output += newString
    }

    if(output === "") output = messages.no_raid_history

    // Return the message to the user
    return message.reply({content: output})
}

/**
 * @author Lewis Page
 * @description Shows the history of when someone was last visited on an event. Invoked with `$event history visited`
 * @param message The Discord Message, sent.
 * @param content The Message Content, seperated by spaces.
 * @returns A Message Reply Promise
 */
export async function visitedHistory(message: Message, content: string[]){
    if(await requireContentLengthOf(message,content,4)){
        return;
    }

 
    const parsedPersonRaided = await parseIntoTwitchURL(content[3].toLowerCase())

    if(parsedPersonRaided.IsError()) return message.reply((parsedPersonRaided.Monad as Error).message)

    // Get raid history
    const beenRaidedHistory = await database.beenRaided.findFirst({where: {url: parsedPersonRaided.Monad as string, serverId: config.server_id}})
    if(!beenRaidedHistory){
        return message.reply({content: messages.never_been_raided})
    }

    // Check if in community
    const member = await database.members.findFirst({where: {url: (parsedPersonRaided.Monad as string).toLowerCase(), serverId: config.server_id}})
    const isOOC = !member

    // Create output
    const time = Math.floor(beenRaidedHistory.lastRaid.getTime() / 1000)
    let output = `The specified user was visited <t:${time}:R>, at the time of <t:${time}:f>`

    // Add to output if is OOC
    if(isOOC){
        output += ", however said user is OOC."
    }
    // Check if NBR
    else if (/OOC/.test(beenRaidedHistory.notes)){
        output += ", however has never been visited in-community."
    }
    // Check if a Priority Event Role
    else if(!!member && (client.channels.cache.get(config.general_channel) as TextChannel)!.members.get(member!.discordID)!
        .roles.cache.some(role => config.priority_event_roles.some(i => role.id === i))){
        output += ", and is currently has a priority event role!"
    }

    // Check if is eligible
    else if (!!member && !(await eligiblity(member))){
        output += ", however is not eligible."
    }

    // Send response
    return message.reply({content: output})
}