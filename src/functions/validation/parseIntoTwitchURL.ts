import parseMentionedUser from "./parseMentionedUser"
import database from "../core/database"
import messages from "../models/messages"
import ErrorMonad from "../models/ErrorMonad";

/**
 * @author Lewis Page
 * @description Parses a string into a Twitch Username, if possible.
 * @param inputString The Discord ID or Twitch URL of the streamer.
 * @returns An Error Monad, containing either an error of the parsed Twitch Username.
 */
export default async function parseIntoTwitchUrl(inputString : string) : Promise<ErrorMonad<string>>{
    // Get the data from the content
    const userParsed = parseMentionedUser(inputString)

    // If the bot was given a discord ID, find the URL in the database instead. If the member does not have a URL or does not exist, return an error inside of a monad.
    const personToRaid = new ErrorMonad(inputString === userParsed ? inputString : await (async ()=>{
        const member = await database.members.findFirst({where: {discordID: userParsed}})
        if(!member) return new Error(messages.no_user_error_third_person)
        if(!member!.url) return new Error(messages.no_user_url_error)

        return member!.url.toLowerCase()
    })())

    return personToRaid
}