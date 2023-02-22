import database from "../../../functions/core/database";

export default async function (personToRaid : string){
    // Figure out if OOC
    const isOOC = !(await database.members.findFirst({where: {url: personToRaid}}))

    // Get Past Record
    let beenRaidedRecord = await database.beenRaided.findFirst({where: {url: personToRaid}})

    // Figure out if NBR
    const isNBR = !isOOC && (!beenRaidedRecord || /OOC/.test(beenRaidedRecord.notes))

    // Create Note
    const notes = `${isOOC ? "OOC " : ""}${isNBR ? "NBR" : ""}`

    // Create record if needed
    if(!beenRaidedRecord){
        beenRaidedRecord = await database.beenRaided.create({data:{
            url: personToRaid,
            lastRaid: new Date(),
            notes: notes
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