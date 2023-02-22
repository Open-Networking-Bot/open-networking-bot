import parseMentionedUser from "./parseMentionedUser"

/**
 * @author Lewis Page
 * @description Finds all the IDs referenced in a message.
 * @param message the message to parse into several users
 * @returns a list of all the GuildMember IDs found.
 */
export default function parseSeveralMentionedUsers(message : string){
    const split = message.replace(/</g, " <").replace(/>/g, "> ").split(" ")
    const tags = split.filter(tag => tag.match(/^</))
    return tags.map(parseMentionedUser)
}