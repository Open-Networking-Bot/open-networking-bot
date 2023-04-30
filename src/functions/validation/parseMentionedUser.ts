const discordMentionedUserRegexStandard = /^<@\d+>$/
const discordMentionedUserRegexExclamation = /^<@!\d+>$/

/**
 * @author Lewis Page
 * @description Converts a Discord Mention into a Discord ID, when fed into the function. The function does nothing if a mention is not used.
 * @param input A string, containing either a Discord Mention or a Discord ID
 * @returns The string, with a mention being replaced with a Discord ID
 */
export default function parseMentionedUser(input : string) : string {
    if(discordMentionedUserRegexStandard.test(input)) return input.slice(2, input.length - 1)
    if(discordMentionedUserRegexExclamation.test(input)) return input.slice(3, input.length - 1)
    return input
}