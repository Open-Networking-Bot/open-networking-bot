import database from "../../../functions/core/database";
import config from "../../../functions/models/config";

/**
 * @author Lewis Page
 * @description Creates or updates a been raided record when someone has been visited
 * @param personToRaid The person who was raided
 * @returns The been raided record, created
 */
export default async function updateBeenRaidedRecord(personToRaid : string){
    // Figure out if OOC
    const isOOC = !(await database.members.findFirst({where: {url: personToRaid, serverId: config.server_id}}))

    // Get Past Record
    let beenRaidedRecord = await database.beenRaided.findFirst({where: {url: personToRaid, serverId: config.server_id}})

    // Figure out if NBR
    const isNBR = !isOOC && (!beenRaidedRecord || /OOC/.test(beenRaidedRecord.notes))

    // Create Note
    const notes = `${isOOC ? "OOC " : ""}${isNBR ? "NBR" : ""}`

    // Create record if needed
    if(!beenRaidedRecord){
        beenRaidedRecord = await database.beenRaided.create({data:{
            url: personToRaid,
            lastRaid: new Date(),
            notes: notes,
            serverId: config.server_id
        }})
    }

    // Update record if needed
    else{
        beenRaidedRecord = (await database.beenRaided.update({
            where: {id: beenRaidedRecord.id},
            data: {
                lastRaid: new Date(),
                notes: notes
            }
        }))!
    }

    return beenRaidedRecord
}