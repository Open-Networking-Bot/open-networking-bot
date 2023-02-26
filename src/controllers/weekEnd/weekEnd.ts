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

export default async (data : StandardDataFormat, member : members) => {

    const updatedMember = await database.members.update({
        where: {id: member.id},
        data: {expressEligible: data.eligibleForExpress, numberOfWarnings: data.numberOfWarnings}
    })

    const discordMember = await ((await client.guilds.fetch(config.server_id)).members.fetch(member.discordID))

    if(updatedMember.numberOfWarnings > 0 && config.dm_for_failed_activity_check) 
        dmUser(discordMember, messages[`stage_${updatedMember.numberOfWarnings >= 3 ? 3 : updatedMember.numberOfWarnings}`])

}

export const weekEndOnLeaveHandler : onLeaveExtraExclusionCriteria = (onLeaveRecord : onLeave, dateRange : DateRange) => {
    return onLeaveRecord.endingDate!.getTime() > (dateRange.dateToStartFrom.getTime() - dateRange.weeksToConsider * WEEK)
}