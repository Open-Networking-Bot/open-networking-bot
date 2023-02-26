import config from "../models/config";
import totalPointsCalculator from "../util/totalPointsCalculator";
import {members, onLeave, raidParticipationHistory, support} from "@prisma/client";
import {WEEK} from "../core/magicNumbers"
import StandardDataFormat from "../models/standardDataFormat";

type criticalData = {
    member : members,
    onLeaveRecord : onLeave | null,
    allRaids : raidParticipationHistory[],
    supportEntries : support[],
}

export interface DateRange {
    dateToStartFrom : Date,
    weeksToConsider : number
}

interface UserDataDateRange extends DateRange {
    definitionOfWeek : number
}

 export default function (data : criticalData, activityCheck : boolean, dates : UserDataDateRange | DateRange) : StandardDataFormat {

    const {member, onLeaveRecord, allRaids, supportEntries} = data
    const {dateToStartFrom, weeksToConsider} = dates
    const weekDefinition = ((()=>{
        if(!!(dates as UserDataDateRange).definitionOfWeek) return (dates as UserDataDateRange).definitionOfWeek
        else return WEEK
    })())

    let tempWarnings = member.numberOfWarnings

    const timePeriod = weekDefinition * weeksToConsider
    const currentDate = dateToStartFrom.getTime()

    // Find how many points the person got from raids in the full time period
    let userRaidPointsOverTimePeriod = 0
    let userRaidPointsOverWeek = 0

    for(let raid of allRaids){
        if(raid.membersId !== member.id) continue;
        if(raid.raidDate.getTime() > currentDate - timePeriod) userRaidPointsOverTimePeriod += raid.pointsAwarded
        if(raid.raidDate.getTime() > currentDate - weekDefinition) userRaidPointsOverWeek += raid.pointsAwarded
    }

    let numberOfSupported = 0
    let numberOfExpressInLastWeek = 0
    let numberOfSupportedInLastWeek = 0
    let numberOfShoutoutTags = 0
    let numberOfShoutoutTagsInLastWeek = 0
    let numberOfInviteTags = 0
    let numberOfInviteTagsInLastWeek = 0

    const currentPointTotal : {day: number, points: number}[] = []
    
    for (let entry of supportEntries){

        let changed = false
        for(let totalEntry of currentPointTotal){
            if(entry.date.getDay() + 1 < totalEntry.day || totalEntry.day > entry.date.getDay() - 1){
                totalEntry.points += entry.expressSupport
                changed = true
            }
        }
        if(!changed) currentPointTotal.push({day: entry.date.getDay(), points: entry.expressSupport})

        numberOfSupported += entry.whoISupported
        numberOfShoutoutTags += entry.shoutOutSupport
        numberOfInviteTags += entry.inviteSupport

        if(entry.date.getTime() > currentDate - weekDefinition){
            numberOfSupportedInLastWeek += entry.whoISupported
            numberOfExpressInLastWeek += entry.expressSupport
            numberOfShoutoutTagsInLastWeek += entry.shoutOutSupport
            numberOfInviteTagsInLastWeek += entry.inviteSupport
        }
    }

    const numberOfExpressInLastWeekUnclamped = numberOfExpressInLastWeek

    let numberOfExpress = 0
    currentPointTotal.forEach(i => numberOfExpress += config.express_clamp_type === "review" ? 
                    Math.min(i.points, config.maximum_express_tags / config.points_awarded_for_activities.express_support) : i.points)
    numberOfExpressInLastWeek = config.express_clamp_type === "review" ? 
                    Math.min(numberOfExpressInLastWeek, config.maximum_express_tags / config.points_awarded_for_activities.express_support) : numberOfExpressInLastWeek

     // Check if the person failed to meet the minimum criteria
    const totalPointsOverAllWeeks = totalPointsCalculator(userRaidPointsOverTimePeriod, numberOfSupported, numberOfExpress, numberOfShoutoutTags, numberOfInviteTags)
    const totalPointsInWeek = totalPointsCalculator(userRaidPointsOverWeek, numberOfSupportedInLastWeek, numberOfExpressInLastWeek, numberOfShoutoutTagsInLastWeek, numberOfInviteTagsInLastWeek)

    const failedWeek = (totalPointsOverAllWeeks / weeksToConsider) >= config.minimum_points_required_per_week || totalPointsInWeek >= config.minimum_points_required_per_week

    if(activityCheck){
        if(!failedWeek){
           tempWarnings++
        }
        else{
            tempWarnings = 0
        }
    }

    // Check if the person has met the express criteria
    const excessExpressPoints = ((numberOfExpressInLastWeekUnclamped - numberOfExpressInLastWeek) * config.points_awarded_for_activities.express_support)
    const expressEligible = totalPointsInWeek + excessExpressPoints >= config.minimum_points_required_for_express
        && numberOfExpressInLastWeek * config.points_awarded_for_activities.express_support >= config.minimum_express_tags_required_for_express && 
        (!onLeaveRecord || (!!onLeaveRecord.endingDate && onLeaveRecord.startingDate.getTime() < onLeaveRecord.endingDate.getTime()))
    
    // Add their week's to an array
    return {
        discordUsername: member.name,
        discordID: `'${member.discordID}'`,
        twitchUsername: member.url,
        raids: userRaidPointsOverWeek / 10,
        numberOfExpressTags: numberOfExpressInLastWeekUnclamped,
        numberOfSupportedTags: numberOfSupportedInLastWeek,
        numberOfShoutoutTags: numberOfShoutoutTagsInLastWeek,
        numberOfInviteTags: numberOfInviteTagsInLastWeek,
        totalPointsClamped: totalPointsInWeek,
        totalPoints: totalPointsInWeek + excessExpressPoints,
        averagePoints: totalPointsOverAllWeeks / config.weeks_for_average,
        numberOfWarnings: tempWarnings,
        eligibleForExpress: expressEligible,
        isNotOnLeave: activityCheck,
        lastMessage: member.lastMessage.toISOString(),
        comments: member.comments,
    }
}