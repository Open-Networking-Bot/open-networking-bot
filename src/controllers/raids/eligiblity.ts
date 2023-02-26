import { members, onLeave } from "@prisma/client";
import database from "../../functions/core/database";
import findLastMonday from "../../functions/features/findLastMonday";
import { WEEK } from "../../functions/core/magicNumbers";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";

type eligiblityReturn = {
    passedCheck : boolean,
    canBeRaided : () => boolean
}

export default async function (member : members) {

    const guildMember = await (await client.guilds.fetch(config.server_id)).members.fetch(member.discordID)

    const history = await database.raidParticipationHistory.findMany({where: {membersId: member.id}})
    const attendance = !member.url || await database.beenRaided.findMany({where: {url: member.url!}})

    return {
        passedCheck: (history.some(i => findLastMonday(WEEK).getTime() < i.raidDate.getTime()) && member.numberOfWarnings <= 0),
        canBeRaided() { return this.passedCheck || ((attendance !== true && attendance.some(i => new Date().getTime() - WEEK > i.lastRaid.getTime())) 
            && guildMember.roles.cache.some(i => i.id === config.now_live_eligibility_role)) }
    } as eligiblityReturn
}