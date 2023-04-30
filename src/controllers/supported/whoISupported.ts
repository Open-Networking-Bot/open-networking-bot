import { recordHandle, tagCalculation } from "./supportUpdating";
import config from "../../functions/models/config";
import { memberHasRoles } from "../../functions/util/memberHasRole";
import convertIDsToGuildMembers from "../../functions/util/convertIDsToGuildMembers";
import addSupport from "./addSupport";
import { SupportTypes } from "../../functions/models/supportTypes";

export const specialTagCalculation : tagCalculation = (list) => {
    let total = 0
    convertIDsToGuildMembers(list).forEach(i => {
      let points = 1
      if(i.id === config.server_account_discord_id) points = config.server_account_twitch_page_tag_multiplier
      if(memberHasRoles(i, config.priority_event_roles)) points = config.featured_member_tag_multiplier
      total += points
    })
    return total
}

export const handleAddition : recordHandle = async (member, num) => {
    await addSupport(SupportTypes.support, num, member.id)
}

export const handleSubtraction : recordHandle = async (member, num) => {
    await addSupport(SupportTypes.support, num * -1, member.id)
}