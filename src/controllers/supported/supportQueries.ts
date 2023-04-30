import {members} from ".prisma/client";
import database from "../../functions/core/database";
import { DAY } from "../../functions/core/magicNumbers";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Collects x amount of days, worth of support entries, for a specified member.
 * @param days The number of days to fetch.
 * @param member The Database Member to collect the support entries for.
 * @returns Returns the number of days worth of support entires.
 */
export async function collectXDaysOfSupportEntries(days : number, member : members){
    const supportEntries = await database.support.findMany({where: {
        membersId: member.id,
        serverId: config.server_id,
        date: {
            gte: new Date(new Date().getTime() - (DAY * days))
        }
    }})
    if(!supportEntries) return [];

    return supportEntries
}