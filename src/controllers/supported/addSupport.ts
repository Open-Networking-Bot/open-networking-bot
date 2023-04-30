import database from "../../functions/core/database"
import { DAY } from "../../functions/core/magicNumbers"
import config from "../../functions/models/config"
import { SupportTypes } from "../../functions/models/supportTypes"

/**
 * @author Lewis Page
 * @description Creates new support entries, or updates previous ones, to add points to a member.
 * @param type The type of support, being given.
 * @param value The point value of the support, being given.
 * @param membersId The ID of the member, being awarded the points.
 * @returns A promise containing the created/updated database entry.
 */
export default async function addSupport(type : SupportTypes, value : number, membersId : number){
    const currentDate = new Date().getTime()
    const rowCandidate = await database.support.findFirst({where: {
        serverId: config.server_id, 
        type: type,
        membersId: membersId,
        date: {
            gte: new Date(currentDate - DAY)
        }
    }})

    if(!!rowCandidate)
        return database.support.update({where: {
            id: rowCandidate.id
        }, data: {
            value: rowCandidate.value + value
        }})
    
    return database.support.create({
        data: {
            serverId: config.server_id,
            type: type,
            value: value,
            membersId: membersId,
            date: new Date()
        }
    })
}