import { members, onLeave } from "@prisma/client"
import config from "../../functions/models/config"
import database from "../../functions/core/database"
import dmUser from "../../functions/util/dmUser"
import messages from "../../functions/models/messages"
import client from "../../functions/core/serverInit"
import StandardDataFormat from "../../functions/models/standardDataFormat"
import { onLeaveExtraExclusionCriteria } from "./endWeek"
import { DateRange } from "../../functions/features/getUserData"
import { WEEK } from "../../functions/core/magicNumbers"

/**
 * @author Lewis Page
 * @description Handles adjusting data at the end of a week.
 * @param data The Standardized Data, given by an invocation of the `getUserData` function.
 * @param member The Database Member, the function is being ran for.
 */
export default async function weekEndActivityCheckHandler(data : StandardDataFormat, member : members) {

    const updatedMember = await database.members.update({
        where: {id: member.id},
        data: {eventEligible: data.eligibleForCalendar, weeksOfInactivity: data.weeksOfInactivity}
    })

    const discordMember = await ((await client.guilds.fetch(config.server_id)).members.fetch(member.discordID))

    if(updatedMember.weeksOfInactivity > 0 && config.dm_for_failed_activity_check) 
        dmUser(discordMember, messages[`stage_${updatedMember.weeksOfInactivity >= 3 ? 3 : updatedMember.weeksOfInactivity}`])

}

/**
 * @author Lewis Page
 * @description Checks if someone is On Leave or not.
 * @param onLeaveRecord The OnLeave record, in question.
 * @param dateRange The date to start counting from and the number of weeks to consider.
 * @returns If the member is On Leave or not.
 */
export const weekEndOnLeaveHandler : onLeaveExtraExclusionCriteria = (onLeaveRecord : onLeave, dateRange : DateRange) => {
    return onLeaveRecord.endingDate!.getTime() > (dateRange.dateToStartFrom.getTime() - dateRange.weeksToConsider * WEEK)
}