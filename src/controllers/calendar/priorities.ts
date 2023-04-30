import { Message, MessageAttachment } from "discord.js";
import database from "../../functions/core/database";
import { collectXDaysOfSupportEntries } from "../supported/supportQueries";
import {members, eventParticipationHistory, support} from "@prisma/client"
import getUserData from "../../functions/features/getUserData";
import { WEEK } from "../../functions/core/magicNumbers";
import csvMaker from "../../functions/util/csvMaker";
import rootDir from "../../functions/util/rootDir";
import path from "path";
import fs from "fs/promises";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Creates a CSV File, containing the priority people have, regarding claiming slots. This is invoked with the command `$calendar priorities`
 * @param message The Discord Message, sent
 */
export default async function calendarPriorities(message : Message){
    const members = await database.members.findMany({where: {serverId: config.server_id}})
    const today = new Date().getTime()

    // A hashmap holding an object, containing all the data needed to run getuserdata
    const membersAdvanced : 
    {member : members, eventParticipationHistory : eventParticipationHistory[], supportTags : support[]}[]
     = []

    // Get the raidParticipationHistory and support entries of the member. Load the promises into an array.
    const memberPromises = []
    for(let member of members){
        const raidData = database.eventParticipationHistory.findMany({where: {membersId: member.id, serverId: config.server_id}})
        const supportEntries = collectXDaysOfSupportEntries(7, member)

        memberPromises.push(raidData, supportEntries)
        membersAdvanced[member.id] = {member: member, eventParticipationHistory: [], supportTags: []}
    }

    // Resolve the promises and fill out he hashmap
    const resolved = await Promise.all(memberPromises)
    for(let item of resolved){
        if(item.length === 0) continue;

        // Check if the item is of type raidParticipationHistory
        if(!!((item[0] as any).raidName)){
            membersAdvanced[item[0].membersId].eventParticipationHistory = (item as eventParticipationHistory[]).filter(i => !!i.eventDate && i.eventDate.getTime() > today - WEEK)
            continue;
        }
        membersAdvanced[item[0].membersId].supportTags = (item as support[]).filter(i => !!i.date && i.date.getTime() > today - WEEK)
    }

    // Initialise the CSV to return
    const csv : string[][] = [["Discord Username", "Priority"]]
    
    for(let member of membersAdvanced){
        if(!member || !member.member) continue;
        
        const onLeave = await database.onLeave.findFirst({where: {membersId: member.member.id}})
        
        const data = getUserData({ 
            member: member.member,
            onLeaveRecord: onLeave,
            allEvents: member.eventParticipationHistory, 
            supportEntries: member.supportTags
        }, false, {
            dateToStartFrom: new Date(),
            weeksToConsider: 1
        })
        
        const calendarEligible = data.eligibleForCalendar
        const priority = member.member.lastCalendarDate.getTime() > today - WEEK ? "2nd" : "1st"

        await database.members.update({where: {id: member.member.id}, data: {eventEligible: calendarEligible}})

        if(!calendarEligible) continue;
        csv.push([member.member.name, priority])
    }
    
    // Define the file path for the record
    const filePath = path.join(rootDir, "data", "priorities.csv")

    // Create the CSV file
    await fs.writeFile(filePath, csvMaker(csv))

    // Send the file to the end-user
    const file = new MessageAttachment(filePath, `Priorities__${new Date(new Date().getTime() - WEEK).toDateString()}-${new Date().toDateString()}.csv`)
    await message.reply({files: [file]})
}