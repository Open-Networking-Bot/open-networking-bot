import config from "../models/config";
import totalPointsCalculator from "../util/totalPointsCalculator";
import {members, onLeave, eventParticipationHistory, support} from "@prisma/client";
import {WEEK} from "../core/magicNumbers"
import StandardDataFormat from "../models/standardDataFormat";
import { SupportTypes } from "../models/supportTypes";

/**
 * @interface
 * @author Lewis Page
 * @description Holds all the critical data needed to run the `getUserData` algorithm.
 */
interface CriticalData {
    member : members,
    onLeaveRecord : onLeave | null,
    allEvents : eventParticipationHistory[],
    supportEntries : support[],
}

/**
 * @interface
 * @author Lewis Page
 * @description Holds a starting date and the number of weeks to go backwards by. Used in activity report functions.
 */
export interface DateRange {
    dateToStartFrom : Date,
    weeksToConsider : number
}

/**
 * @interface
 * @extends DateRange
 * @author Lewis Page
 * @description An extended date range, allowing for the definition of a week to be defined as well.
 */
interface UserDataDateRange extends DateRange {
    definitionOfWeek : number
}

/**
 * @author Lewis Page
 * @description Turns all factors regarding a member into a single object, defining their current state of activity.
 * @param data The factors regrding the member.
 * @param activityCheck Wether or not the member is being activity checked through the running of this function.
 * @param dates The starting date and number of weeks to consider when processing the data.
 * @returns A standardized object, containing all activity information about the member within the specified date range.
 */
 export default function getUserData(data : CriticalData, activityCheck : boolean, dates : UserDataDateRange | DateRange) : StandardDataFormat {

    const {member, onLeaveRecord, allEvents, supportEntries} = data
    const {dateToStartFrom, weeksToConsider} = dates
    const weekDefinition = ((()=>{
        if(!!(dates as UserDataDateRange).definitionOfWeek) return (dates as UserDataDateRange).definitionOfWeek
        else return WEEK
    })())

    let tempWarnings = member.weeksOfInactivity

    const timePeriod = weekDefinition * weeksToConsider
    const currentDate = dateToStartFrom.getTime()

    // Find how many points the person got from events in the full time period
    let userEventPointsOverTimePeriod = 0
    let userEventPointsOverWeek = 0

    for(let event of allEvents){
        if(event.membersId !== member.id) continue;
        if(event.eventDate.getTime() > currentDate - timePeriod) userEventPointsOverTimePeriod += event.pointsAwarded
        if(event.eventDate.getTime() > currentDate - weekDefinition) userEventPointsOverWeek += event.pointsAwarded
    }

    let numberOfSupported = 0
    let numberOfCalendarInLastWeek = 0
    let numberOfSupportedInLastWeek = 0
    let numberOfShoutoutTags = 0
    let numberOfShoutoutTagsInLastWeek = 0
    let numberOfInviteTags = 0
    let numberOfInviteTagsInLastWeek = 0

    const currentPointTotal : {day: number, points: number}[] = []

    const processPointsToGive = (supportEntry : support) => (expectedType : SupportTypes, expectedPoints : number) => {
        const type = supportEntry.type as SupportTypes
        if(type === expectedType) return expectedPoints * supportEntry.value
        return 0
    }
    
    for (let entry of supportEntries){
        const processEntry = processPointsToGive(entry)

        let changed = false
        for(let totalEntry of currentPointTotal){
            if(entry.date.getDay() + 1 < totalEntry.day || totalEntry.day > entry.date.getDay() - 1){
                totalEntry.points += processEntry(SupportTypes.calendar,
                     config.points_awarded_for_activities.calendar_support)
                changed = true
            }
        }
        if(!changed) currentPointTotal.push({day: entry.date.getDay(),
             points: processEntry(SupportTypes.calendar, config.points_awarded_for_activities.calendar_support)})

        numberOfSupported += processEntry(SupportTypes.support, config.points_awarded_for_activities.who_I_supported)
        numberOfShoutoutTags += processEntry(SupportTypes.shoutout, config.points_awarded_for_activities.shout_out_support)
        numberOfInviteTags += processEntry(SupportTypes.invite, config.points_awarded_for_activities.invited_support)

        if(entry.date.getTime() > currentDate - weekDefinition){
            numberOfSupportedInLastWeek += processEntry(SupportTypes.support,
                 config.points_awarded_for_activities.who_I_supported)

            numberOfCalendarInLastWeek += processEntry(SupportTypes.calendar,
                 config.points_awarded_for_activities.calendar_support)

            numberOfShoutoutTagsInLastWeek += processEntry(SupportTypes.shoutout,
                 config.points_awarded_for_activities.shout_out_support)

            numberOfInviteTagsInLastWeek += processEntry(SupportTypes.invite,
                 config.points_awarded_for_activities.invited_support)
        }
    }

    const numberOfCalendarInLastWeekUnclamped = numberOfCalendarInLastWeek

    let numberOfCalendar = 0
    currentPointTotal.forEach(i => numberOfCalendar += config.calendar_clamp_type === "review" ? 
                    Math.min(i.points, config.maximum_calendar_tags / config.points_awarded_for_activities.calendar_support) : i.points)
    numberOfCalendarInLastWeek = config.calendar_clamp_type === "review" ? 
                    Math.min(numberOfCalendarInLastWeek, config.maximum_calendar_tags / config.points_awarded_for_activities.calendar_support) : numberOfCalendarInLastWeek

     // Check if the person failed to meet the minimum criteria
    const totalPointsOverAllWeeks = totalPointsCalculator(userEventPointsOverTimePeriod, numberOfSupported, numberOfCalendar, numberOfShoutoutTags, numberOfInviteTags)
    const totalPointsInWeek = totalPointsCalculator(userEventPointsOverWeek, numberOfSupportedInLastWeek, numberOfCalendarInLastWeek, numberOfShoutoutTagsInLastWeek, numberOfInviteTagsInLastWeek)

    const failedWeek = (totalPointsOverAllWeeks / weeksToConsider) >= config.minimum_points_required_per_week || totalPointsInWeek >= config.minimum_points_required_per_week

    if(activityCheck){
        if(!failedWeek){
           tempWarnings++
        }
        else{
            tempWarnings = 0
        }
    }

    // Check if the person has met the calendar criteria
    const excessCalendarPoints = ((numberOfCalendarInLastWeekUnclamped - numberOfCalendarInLastWeek) * config.points_awarded_for_activities.calendar_support)
    const calendarEligible = totalPointsInWeek + excessCalendarPoints >= config.minimum_points_required_for_calendar
        && numberOfCalendarInLastWeek * config.points_awarded_for_activities.calendar_support >= config.minimum_calendar_tags_required_for_calendar && 
        (!onLeaveRecord || (!!onLeaveRecord.endingDate && onLeaveRecord.startingDate.getTime() < onLeaveRecord.endingDate.getTime()))
    
    // Add their week's to an array
    return {
        discordUsername: member.name,
        discordID: `'${member.discordID}'`,
        twitchUsername: member.url,
        events: userEventPointsOverWeek / 10,
        numberOfCalendarTags: numberOfCalendarInLastWeekUnclamped,
        numberOfSupportedTags: numberOfSupportedInLastWeek,
        numberOfShoutoutTags: numberOfShoutoutTagsInLastWeek,
        numberOfInviteTags: numberOfInviteTagsInLastWeek,
        totalPointsClamped: totalPointsInWeek,
        totalPoints: totalPointsInWeek + excessCalendarPoints,
        averagePoints: totalPointsOverAllWeeks / config.weeks_for_average,
        weeksOfInactivity: tempWarnings,
        eligibleForCalendar: calendarEligible,
        isNotOnLeave: activityCheck,
        lastMessage: member.lastMessage.toISOString(),
        comments: member.comments,
    }
}