import { members } from "@prisma/client";
import database from "../../functions/core/database";
import findLastMonday from "../../functions/features/findLastMonday";
import { WEEK } from "../../functions/core/magicNumbers";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";

/**
 * @typedef
 * @author Lewis Page
 * @description Used internally to track if members are eligible to be visited, and at what level they can be visited at.
 */
type eligiblityReturn = {
    passedCheck : boolean,
    canBeRaided : () => boolean
}

/**
 * @author Lewis Page
 * @description Analyses what kinds of event eligiblity a specified database member has.
 * @param member The Database Member to check eligiblity for.
 * @returns An `eligiblityReturn` object, telling what event level the member is able to be visited at.
 */
export default async function eventEligiblity(member : members) {

    const guildMember = await (await client.guilds.fetch(config.server_id)).members.fetch(member.discordID)

    const history = await database.eventParticipationHistory.findMany({where: {membersId: member.id}})
    const attendance = !member.url || await database.beenRaided.findMany({where: {url: member.url!}})

    return {
        passedCheck: (history.some(i => findLastMonday(WEEK).getTime() < i.eventDate.getTime()) && member.weeksOfInactivity <= 0),
        canBeRaided() { return this.passedCheck || ((attendance !== true && attendance.some(i => new Date().getTime() - WEEK > i.lastRaid.getTime())) 
            && guildMember.roles.cache.some(i => i.id === config.now_live_eligibility_role)) }
    } as eligiblityReturn
}