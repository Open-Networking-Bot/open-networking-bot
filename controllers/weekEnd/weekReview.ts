import { members } from "@prisma/client"
import database from "../../functions/core/database"
import StandardDataFormat from "../../functions/models/standardDataFormat"

export default async (data : StandardDataFormat, member : members) => {
    await database.members.update({
        where: {id: member.id},
        data: {expressEligible: data.eligibleForExpress}
    })
}