import config from "../models/config";

/**
 * @author Lewis Page
 * @description Calculates the total points given from every category inputted.
 * @param eventPoints The points gained from events.
 * @param whoISupportedTags The points gained from streamer support.
 * @param calendarTags The points gained from calendar support.
 * @param shoutOutTags The points gained from shoutout support.
 * @param inviteTags The points gained from invite support.
 * @returns The total points given
 */
export default function calculatePoints(eventPoints : number, whoISupportedTags : number, calendarTags : number, shoutOutTags : number, inviteTags : number) {
    return ((calendarTags * config.points_awarded_for_activities.calendar_support)
    + (whoISupportedTags * config.points_awarded_for_activities.who_I_supported)
    + (shoutOutTags * config.points_awarded_for_activities.shout_out_support)
    + (inviteTags * config.points_awarded_for_activities.invited_support)
    + (eventPoints))
}