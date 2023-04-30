import { members } from "@prisma/client"
import database from "../../functions/core/database"
import StandardDataFormat from "../../functions/models/standardDataFormat"

/**
 * @author Lewis Page
 * @description Handles adjusting data upon a week review.
 * @param data The Standardized Data, given by an invocation of the `getUserData` function.
 * @param member The Database Member, the function is being ran for.
 */
export default async function weekReviewActivityCheckHandler(data : StandardDataFormat, member : members) {
    await database.members.update({
        where: {id: member.id},
        data: {eventEligible: data.eligibleForCalendar}
    })
}