import { beenRaided, members, eventParticipationHistory } from "@prisma/client";
import { GuildMember, Message } from "discord.js";
import database from "../../functions/core/database";
import { DAY, HOUR, WEEK } from "../../functions/core/magicNumbers";
import client from "../../functions/core/serverInit";
import { get as getLivePosts } from "../../functions/features/currentlyLive";
import findLastMonday from "../../functions/features/findLastMonday";
import config from "../../functions/models/config";
import messages from "../../functions/models/messages";
import { memberHasRoles } from "../../functions/util/memberHasRole";
import sanitiseMarkdown from "../../functions/validation/sanitiseMarkdown";

/**
 * @author Lewis Page
 * @description Creates a string, containing every member who is eligible to be visited, in a certain category.
 * @param members the members to be visited
 * @param tag what priority the members have
 * @returns a string of all the members who can be raided
 */
function formatWhoToRaid(members : members[], tag : string){
    let output = ""
    for(let member of members) if(!!member.url && member.url !== "null") output += `- ${sanitiseMarkdown(member.name)} (<https://www.twitch.tv/${member.url}>) [${tag}]\n`
    return output
}
/**
 * @author Lewis Page
 * @description Finds if a member can be visited weekly
 * @param discordMember The GuildMember of the person to find eligibility for
 * @param beenRaidedHistory The `beenRaided` row in the database, for who to find eligiblity for
 * @returns Wether the member can be visited weekly
 */
function canBeRaidedWeekly(discordMember : GuildMember, beenRaidedHistory : beenRaided | null){
    const hasOptedOut = discordMember.roles.cache.some(role => config.event_exclusion_role === role.id || config.exempt_roles.some(r => r === role.id))

    const lastRaidTrainNotTooEarly = beenRaidedHistory === null || beenRaidedHistory.lastRaid.getTime() < new Date().getTime() - WEEK + HOUR
    const isOverLevel10 = discordMember.roles.cache.some(role => config.now_live_eligibility_role === role.id)

    return !hasOptedOut && lastRaidTrainNotTooEarly && isOverLevel10
}

/**
 * @author Lewis Page
 * @description Finds wether a member can be visited daily.
 * @param discordMember The GuildMember of the person to find eligibility for
 * @param databaseMember The `member` row in the database, for who to find eligiblity for
 * @param beenRaidedHistory The `beenRaided` row in the database, for who to find eligiblity for
 * @param eventAttendanceHistory The event attendance for who to find eligiblity for
 * @returns a boolean, showing wether the member can be visited daily.
 */
function findMemberRaidTrainEligiblity(discordMember : GuildMember, databaseMember : members, beenRaidedHistory : beenRaided | null, eventAttendanceHistory : eventParticipationHistory[]){
    const hasNoWarnings = databaseMember.weeksOfInactivity <= 0
    const hasAttenedRaidTrainInLastWeek = eventAttendanceHistory.some(record => record.eventDate.getTime() > findLastMonday(WEEK).getTime())
    const hasOptedOut = discordMember.roles.cache.some(role => config.event_exclusion_role === role.id || config.exempt_roles.some(r => r === role.id))

    const lastRaidTrainNotTooEarly = beenRaidedHistory === null || beenRaidedHistory.lastRaid.getTime() < new Date().getTime() - DAY + HOUR
    const isExcludedFromTimeChecks = discordMember.roles.cache.some(role => config.priority_event_roles.some(raidJunkieRole => raidJunkieRole === role.id))

    return hasNoWarnings && !hasOptedOut && ((lastRaidTrainNotTooEarly && hasAttenedRaidTrainInLastWeek) || isExcludedFromTimeChecks)
}

/**
 * @author Lewis Page
 * @description Scans through Guild Member presence, and the live post cache, to see who is live in the server.
 * @returns a list of all currently live members, in the SSS.
 */
export async function getAllLiveMembers(){
    const liveChannelPosts = getLivePosts()
    const mappedLiveChannelPosts = liveChannelPosts.map(p => p.member)

    const allMembers = (await client.guilds.fetch(config.server_id)).members.cache
    const membersStreaming = allMembers.filter(m => !!m.presence && m.presence.activities.map(activity => activity.type).includes("STREAMING")).map(m => m)

    const filteredMembers : GuildMember[] = []
    for(let member of [...mappedLiveChannelPosts, ...membersStreaming]){
        if(!member) continue;

        if(!filteredMembers.some(m => m.id === member!.id)) filteredMembers.push(member!)
    }

    return filteredMembers
}

/**
 * @author Lewis Page
 * @description Finds the neccecary information, regarding Guild Members.
 * @param discordMembers the GuildMembers to find information about
 * @returns the GuildMember, DatabaseMember, Raid Train Histroy and Been Raided Record of each member, specified.
 */
async function findDatabaseInfoAboutMembers(discordMembers : GuildMember[]) {

    const results = []
    for(let member of discordMembers){
        const databaseMember = await database.members.findFirst({where: {discordID: member.id, serverId: config.server_id}})

        if(databaseMember === null || databaseMember.url === null) continue;

        const raidTrainPromise = database.eventParticipationHistory.findMany({where: {membersId: databaseMember.id, serverId: config.server_id}})
        const beenRaidedPromise = database.beenRaided.findFirst({where: {url: databaseMember.url.toLowerCase(), serverId: config.server_id }})
        
        const promiseResults = await database.$transaction([raidTrainPromise, beenRaidedPromise])
        results.push({
            discordMember: member,
            databaseMember: databaseMember,
            raidTrainHistory: promiseResults[0],
            beenRaided: promiseResults[1]
        })
    }
    return results
}

/**
 * @author Lewis Page
 * @description Works the functionality of the `$raid list` command.
 * @param message The Discord message, sent
 * @returns a message reply promise
 */
export default async function raidList(message : Message){
    const members = await findDatabaseInfoAboutMembers(await getAllLiveMembers())

    const nbrToRaid = []
    const longTimeToRaid = []
    const standardToRaid = []
    const weeklyToRaid = []
    const featuredtoRaid = []

    for(let member of members){
        if(member.discordMember.roles.cache.some(role => role.id === config.on_leave_role)) continue;

        if(member.beenRaided === null || member.beenRaided.notes.match(/OOC/)){
            nbrToRaid.push(member.databaseMember)
            continue;
        }

        if(memberHasRoles(member.discordMember, config.priority_event_roles)
            && member.beenRaided.lastRaid.getTime() < new Date().getTime() - HOUR){
            featuredtoRaid.push(member.databaseMember)
            continue
        }

        if(findMemberRaidTrainEligiblity(member.discordMember, member.databaseMember,
             member.beenRaided, member.raidTrainHistory)){

            if(member.beenRaided!.lastRaid.getTime() < new Date().getTime() - WEEK + HOUR)
                longTimeToRaid.push(member.databaseMember)
            else 
                standardToRaid.push(member.databaseMember)
            
            continue;
        }

        if(canBeRaidedWeekly(member.discordMember, member.beenRaided))
            weeklyToRaid.push(member.databaseMember)
    }

    let output = formatWhoToRaid(nbrToRaid, "NBR")
    output += formatWhoToRaid(longTimeToRaid, "Long time since raided")
    output += formatWhoToRaid(standardToRaid, "Standard")
    output += formatWhoToRaid(weeklyToRaid, "Weekly")
    output += formatWhoToRaid(featuredtoRaid, "Featured Member")
    
    if(output === "") output = "There is no one in-community to visit right now."

    return message.reply(output)
}