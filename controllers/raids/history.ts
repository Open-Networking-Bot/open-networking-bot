import {Message, TextChannel} from "discord.js";
import authenticate from "../../functions/util/authenticate";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import client from "../../functions/core/serverInit";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import {members} from "@prisma/client"
import database from "../../functions/core/database";
import parseIntoTwitchURL from "../../functions/validation/parseIntoTwitchURL";
import eligiblity from "./eligiblity";

const findUser = async (message: Message, content: string[])=>{
    // Get targeted user
    let user : members | null
    if(content.length >= 4){
        user = await database.members.findFirst({where: {discordID: parseMentionedUser(content[3])}})
        if(!user){
            await message.reply({content: messages.no_user})
            return
        }
    }
    else{
        user = await database.members.findFirst({where: {discordID: message.author.id}})
        if(!user){
            await message.reply({content: messages.no_user_error})
            return
        }
    }

    return user
}

export async function raidAttendanceHistory(message: Message, content: string[]){

    const user = await findUser(message,content)

    if(!user) return;

    // Get the user's raid history
    const raids = await database.raidParticipationHistory.findMany({where: {membersId: user.id}})

    // Create output
    let output = ""

    for (let raid of raids){
        const newString = `- Raid on <t:${Math.floor(raid.raidDate.getTime() / 1000)}:F>: (${raid.pointsAwarded} points)\n`
        if(newString.length + output.length > 2000){
            break;
        }
        output += newString
    }

    if(output === "") output = messages.no_raid_history

    // Return the message to the user
    return message.reply({content: output})
}

export async function raidedHistory(message: Message, content: string[]){
    if(await requireContentLengthOf(message,content,4)){
        return;
    }

    const parsedPersonRaided = await parseIntoTwitchURL(content[3].toLowerCase())

    if(parsedPersonRaided.IsError()) return message.reply((parsedPersonRaided.Monad as Error).message)

    // Get raid history
    const beenRaidedHistory = await database.beenRaided.findFirst({where: {url: parsedPersonRaided.Monad as string}})
    if(!beenRaidedHistory){
        return message.reply({content: messages.never_been_raided})
    }

    // Check if in community
    const member = await database.members.findFirst({where: {url: (parsedPersonRaided.Monad as string).toLowerCase()}})
    const isOOC = !member

    // Create output
    const time = Math.floor(beenRaidedHistory.lastRaid.getTime() / 1000)
    let output = `The specified user was raided <t:${time}:R>, at the time of <t:${time}:f>`

    // Add to output if is OOC
    if(isOOC){
        output += ", however said user is OOC."
    }
    // Check if NBR
    else if (/OOC/.test(beenRaidedHistory.notes)){
        output += ", however has never been raided in-community."
    }
    // Check if a Raid Junkie
    else if(!!member && (client.channels.cache.get(config.general_channel) as TextChannel)!.members.get(member!.discordID)!
        .roles.cache.some(role => config.raid_junkie_roles.some(i => role.id === i))){
        output += ", and is currently a raid junkie!"
    }

    // Check if is eligible
    else if (!!member && !(await eligiblity(member))){
        output += ", however is not eligible."
    }

    // Send response
    return message.reply({content: output})
}