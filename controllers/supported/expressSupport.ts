import {getTodaysSupportEntry, collectXDaysOfSupportEntries} from "./supportQueries";
import database from "../../functions/core/database";
import { Lock } from "./expressLock"
import { members } from "@prisma/client";
import config from "../../functions/models/config";
import { recordHandle } from "./supportUpdating";

export async function Clamp(tags : number, member : members) {
    let twoDayExpressTags = 0;
    (await collectXDaysOfSupportEntries(2, member)).forEach(i => twoDayExpressTags += i.expressSupport)

    const twoDayExpressPoints = twoDayExpressTags * config.points_awarded_for_activities.express_support
    const tagPoints = tags * config.points_awarded_for_activities.express_support
    const totalExpressPoints = twoDayExpressPoints + tagPoints
    return totalExpressPoints >= config.maximum_express_tags ?
        Math.max((config.maximum_express_tags - twoDayExpressPoints) / config.points_awarded_for_activities.express_support, 0):
        tags
}

export const handleAddition : recordHandle = async (member, num) => {
    const supportEntry = await getTodaysSupportEntry(member)
    const pointsAwarded = config.express_clamp_type === "database" ? await Clamp(num, member) : num

    await database.support.update({where: {id: supportEntry.id}, data: {expressSupport: supportEntry.expressSupport + pointsAwarded}})
}

export const handleSubtraction : recordHandle = async (member, num) => {
    if(await Lock.isActive()) return;

    const supportEntry = await getTodaysSupportEntry(member)

    await database.support.update({where: {id: supportEntry.id}, data: {expressSupport: supportEntry.expressSupport - num}})
}