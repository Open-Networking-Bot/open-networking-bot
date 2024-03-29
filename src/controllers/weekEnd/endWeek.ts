import {Collection, Message, MessageAttachment, Role} from "discord.js";
import config from "../../functions/models/config";
import fs from "fs/promises";
import path from "path";
import rootDir from "../../functions/util/rootDir";
import csvMaker from "../../functions/util/csvMaker";
import getUserData, { DateRange } from "../../functions/features/getUserData";
import {collectXDaysOfSupportEntries} from "../supported/supportQueries";
import client from "../../functions/core/serverInit";
import database from "../../functions/core/database";
import {logMessage, logType} from "../logging/loggingManager";
import { MONTH, WEEK } from "../../functions/core/magicNumbers";
import { members, onLeave } from "@prisma/client";
import { saveMessageHistory } from "../misc/messageHandler";
import StandardDataFormat from "../../functions/models/standardDataFormat";

export type dataUpdateHandler = (userData : StandardDataFormat, member : members) => Promise<void>
export type onLeaveExtraExclusionCriteria = (onLeaveRecord : onLeave, dateRange : DateRange) => boolean

/**
 * @author Lewis Page
 * @description Creates a message attachment, containing an activity report of the server.
 * @param handler A callback function, containing the logic for how data should be handled when scanned in the activity report.
 * @param dateRange How many weeks to consider in the report, and what UNIX Timecode to start counting from.
 * @param onLeaveHandler A lambda function, which inputs the considered On Leave record and report date, and outputs if they should be excluded from the report.
 * @returns The created message attachment
 */
export async function endWeekLogic(handler : dataUpdateHandler, dateRange : DateRange, onLeaveHandler : onLeaveExtraExclusionCriteria){

    // Update latest messages
    await saveMessageHistory()

    // Get Members
    const allMembers = await database.members.findMany()

    // Get all events in the last week
    const allEvents = (await database.eventParticipationHistory.findMany()).filter(event => {
        const date = new Date()
        return event.eventDate.getDate() >= date.getDate() - (config.use_weekly_average ? config.weeks_for_average * 7 : 7)
    })

    // Make the start of the CSV data
    const data : any[][] = [[
        "discordUsername",
        "discordID",
        "twitchUsername",
        "events",
        "numberOfCalendarTags",
        "numberOfSupportedTags",
        "numberOfShoutoutTags",
        "numberOfInviteTags",
        "totalPointsClamped",
        "totalPoints",
        "averagePoints",
        "weeksOfInactivity",
        "eligibleForCalendar",
        "isNotOnLeave",
        "lastMessage",
        "comments"
    ]]

    // Get server guild
    const guild = await client.guilds.fetch(config.server_id)

    // Get On Leave Records
    const onLeaveRecords = await database.onLeave.findMany({where: {serverId: config.server_id}})

    // Iterate through every member
    for (let i = 0; i < allMembers.length; i++){

        const member = allMembers[i]

        // Verify that the user is supposed to be activity checked
        let roles : Collection<string, Role> | null = null
        try{
            roles = (await guild.members.fetch(member.discordID)).roles.cache
        }
        catch{
            logMessage(`The member ${member.name} (${member.discordID}) is still in the database, even though they cannot be found in the server`, logType.warning)
            continue;
        }

        let activityChecked = true

        for (let role of roles) for (let roleID of config.exempt_roles) if(role[1].id === roleID) activityChecked = false

        for (let record of onLeaveRecords) {
            if(record.membersId !== member.id) continue;
            if (!record.endingDate || record.startingDate.getTime() > record.endingDate.getTime() || onLeaveHandler(record, dateRange))
                activityChecked = false;
                
            if(new Date().getTime() - record.startingDate.getTime() > MONTH && (!record.endingDate || record.endingDate.getTime() <= record.startingDate.getTime()))
                await logMessage(`${member.name} has been on leave for longer than a month`, logType.alert)
        }

        const weeksSinceServerJoin = Math.trunc((dateRange.dateToStartFrom.getTime() - member.joinedServer.getTime()) / WEEK)
        if (weeksSinceServerJoin < 2) activityChecked = false

        // Get support entries
        const supportEntries = await collectXDaysOfSupportEntries(config.use_weekly_average ? 7 * config.weeks_for_average : 7, member)

        // Get OnLeave record
        const onLeaveRecord = await database.onLeave.findFirst({where: {membersId: member.id, serverId: config.server_id}})

        // Fill in user data
        const userData = getUserData({
            member: member,
            onLeaveRecord: onLeaveRecord,
            supportEntries: supportEntries,
            allEvents: allEvents
        }, activityChecked ,{
            weeksToConsider: config.use_weekly_average ? Math.min(weeksSinceServerJoin, config.weeks_for_average) : 1,
            dateToStartFrom: dateRange.dateToStartFrom,
            definitionOfWeek: dateRange.weeksToConsider * WEEK
        })

        data[i + 1] = [
            userData.discordUsername,
            userData.discordID,
            userData.twitchUsername,
            userData.events,
            userData.numberOfCalendarTags,
            userData.numberOfSupportedTags,
            userData.numberOfShoutoutTags,
            userData.numberOfInviteTags,
            userData.totalPointsClamped,
            userData.totalPoints,
            userData.averagePoints,
            userData.weeksOfInactivity,
            userData.eligibleForCalendar,
            userData.isNotOnLeave,
            userData.lastMessage,
            userData.comments
        ]

        // Handle week review/week end
        await handler(userData, member)

    }

    // Define the file path for the record
    const filePath = path.join(rootDir, "data", "week.csv")

    // Create the CSV file
    await fs.writeFile(filePath, csvMaker(data))

    // Return the file
    return new MessageAttachment(filePath, 
        `Week__${new Date(dateRange.dateToStartFrom.getTime() - (dateRange.weeksToConsider * WEEK)).toDateString()}-${dateRange.dateToStartFrom.toDateString()}.csv`)
}

//
/**
 * @author Lewis Page
 * @description Handles the creation of reports when a `$week` style command is invoked.
 * @param handler A callback function, containing the logic for how data should be handled when scanned in the activity report.
 * @param dateRange How many weeks to consider in the report, and what UNIX Timecode to start counting from.
 * @param onLeaveHandler A lambda function, which inputs the considered On Leave record and report date, and outputs if they should be excluded from the report.
 * @param message The Discord Message, sent.
 */
export default async function endWeekCommandController(handler : dataUpdateHandler, dateRange : DateRange, onLeaveHandler : onLeaveExtraExclusionCriteria, message : Message) {
    const file = await endWeekLogic(handler, dateRange, onLeaveHandler)
    await message.reply({files: [file]})
}