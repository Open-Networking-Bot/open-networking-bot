/**
 * @interface
 * @author Lewis Page
 * @description An object, containing all the possible important information on a specified member. Used in the calendar and week command categories, mostly.
 */
export default interface StandardDataFormat {
    discordUsername: string,
    discordID: string,
    twitchUsername: string | null,
    events: number,
    numberOfCalendarTags: number,
    numberOfSupportedTags: number,
    numberOfShoutoutTags: number,
    numberOfInviteTags: number,
    totalPointsClamped: number,
    totalPoints: number,
    averagePoints: number,
    weeksOfInactivity: number,
    eligibleForCalendar: boolean,
    isNotOnLeave: boolean,
    lastMessage: string,
    comments: string,
}