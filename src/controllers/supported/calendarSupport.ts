import {collectXDaysOfSupportEntries} from "./supportQueries";
import { Lock } from "./calendarLock"
import { members } from "@prisma/client";
import config from "../../functions/models/config";
import { recordHandle } from "./supportUpdating";
import { SupportTypes } from "../../functions/models/supportTypes";
import addSupport from "./addSupport";

/**
 * @author Lewis Page
 * @description Returns the number of points to give, regarding the calendar point clamp.
 * @param tags The number of tags, provided by the member.
 * @param member The member's database record
 * @returns The amount of points to give
 */
export async function Clamp(tags : number, member : members) {
    let twoDayCalendarTags = 0;
    (await collectXDaysOfSupportEntries(2, member)).forEach(i => twoDayCalendarTags += i.type === SupportTypes.calendar ? i.value : 0)

    const twoDayExpressPoints = twoDayCalendarTags * config.points_awarded_for_activities.calendar_support
    const tagPoints = tags * config.points_awarded_for_activities.calendar_support
    const totalExpressPoints = twoDayExpressPoints + tagPoints
    return totalExpressPoints >= config.maximum_calendar_tags ?
        Math.max((config.maximum_calendar_tags - twoDayExpressPoints) / config.points_awarded_for_activities.calendar_support, 0):
        tags
}

/**
 * @author Lewis Page
 * @description Adds Calendar Points from a member
 * @param member The database member, with points being added to
 * @param num The number of points to be added
 */
export const handleAddition : recordHandle = async (member, num) => {
    const pointsAwarded = config.calendar_clamp_type === "database" ? await Clamp(num, member) : num

    await addSupport(SupportTypes.calendar, pointsAwarded, member.id)
}

/**
 * @author Lewis Page
 * @description Removes Calendar Points from a member
 * @param member The database member, with points being removed from
 * @param num The number of points to be added
 */
export const handleSubtraction : recordHandle = async (member, num) => {
    if(await Lock.isActive()) return;

    await addSupport(SupportTypes.calendar, num * -1, member.id)
}