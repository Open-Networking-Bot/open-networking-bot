import { Message, MessageAttachment } from "discord.js";
import database from "../../functions/core/database";
import { collectXDaysOfSupportEntries } from "../supported/supportQueries";
import {members, raidParticipationHistory, support} from "@prisma/client"
import getUserData from "../../functions/features/getUserData";
import { WEEK } from "../../functions/core/magicNumbers";
import csvMaker from "../../functions/util/csvMaker";
import rootDir from "../../functions/util/rootDir";
import path from "path";
import fs from "fs/promises";

export default async function(message : Message){
    const members = await database.members.findMany()
    const today = new Date().getTime()

    // A hashmap holding an object, containing all the data needed to run getuserdata
    const membersAdvanced : {member : members, raidParticipationHistory : raidParticipationHistory[], supportTags : support[]}[] = []

    // Get the raidParticipationHistory and support entries of the member. Load the promises into an array.
    const memberPromises = []
    for(let member of members){
        const raidData = database.raidParticipationHistory.findMany({where: {membersId: member.id}})
        const supportEntries = collectXDaysOfSupportEntries(7, member)

        memberPromises.push(raidData, supportEntries)
        membersAdvanced[member.id] = {member: member, raidParticipationHistory: [], supportTags: []}
    }

    // Resolve the promises and fill out he hashmap
    const resolved = await Promise.all(memberPromises)
    for(let item of resolved){
        if(item.length === 0) continue;

        // Check if the item is of type raidParticipationHistory
        if(!!((item[0] as any).raidName)){
            membersAdvanced[item[0].membersId].raidParticipationHistory = (item as raidParticipationHistory[]).filter(i => !!i.raidDate && i.raidDate.getTime() > today - WEEK)
            continue;
        }
        membersAdvanced[item[0].membersId].supportTags = (item as support[]).filter(i => !!i.date && i.date.getTime() > today - WEEK)
    }

    // Initialise the CSV to return
    const csv : string[][] = [["Discord Username", "Priority"]]
    
    for(let member of membersAdvanced){
        if(!member || !member.member) continue;
        
        const onLeave = await database.onLeave.findFirst({where: {membersId: member.member.id}})
        
        const data = getUserData({ member: member.member, onLeaveRecord: onLeave, allRaids: member.raidParticipationHistory, supportEntries: member.supportTags}, false, {
            dateToStartFrom: new Date(),
            weeksToConsider: 1
        })
        
        const expressEligible = data.eligibleForExpress
        const priority = member.member.lastExpressDate.getTime() > today - WEEK ? "2nd" : "1st"

        await database.members.update({where: {id: member.member.id}, data: {expressEligible: expressEligible}})

        if(!expressEligible) continue;
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