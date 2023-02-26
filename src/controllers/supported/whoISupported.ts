import {getTodaysSupportEntry} from "./supportQueries";
import database from "../../functions/core/database";
import { recordHandle, tagCalculation } from "./supportUpdating";
import config from "../../functions/models/config";
import { memberHasRoles } from "../../functions/util/memberHasRole";
import convertIDsToGuildMembers from "../../functions/util/convertIDsToGuildMembers";

export const specialTagCalculation : tagCalculation = (list) => {
    let total = 0
    convertIDsToGuildMembers(list).forEach(i => {
      let points = 1
      if(i.id === config.sss_discord_id) points = config.sss_twitch_page_tag_multiplier
      if(memberHasRoles(i, config.raid_junkie_roles)) points = config.featured_member_tag_multiplier
      total += points
    })
    return total
}

export const handleAddition : recordHandle = async (member, num) => {
    const supportEntry = await getTodaysSupportEntry(member)

    await database.support.update({where: {id: supportEntry.id}, data: {whoISupported: supportEntry.whoISupported + num}})
}

export const handleSubtraction : recordHandle = async (member, num) => {
    const supportEntry = await getTodaysSupportEntry(member)

    await database.support.update({where: {id: supportEntry.id}, data: {whoISupported: supportEntry.whoISupported - num}})
}