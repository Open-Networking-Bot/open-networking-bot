import database from "../../functions/core/database"
import { getTodaysSupportEntry } from "./supportQueries"
import { recordHandle } from "./supportUpdating"

export const handleAddition : recordHandle = async (member, num) => {
    const supportEntry = await getTodaysSupportEntry(member)

    await database.support.update({where: {id: supportEntry.id}, data: {shoutOutSupport: supportEntry.shoutOutSupport + num}})
}

export const handleSubtraction : recordHandle = async (member, num) => {
    const supportEntry = await getTodaysSupportEntry(member)

    await database.support.update({where: {id: supportEntry.id}, data: {shoutOutSupport: supportEntry.shoutOutSupport - num}})
}