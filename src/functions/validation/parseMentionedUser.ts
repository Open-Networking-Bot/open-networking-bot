const discordMentionedUserRegexStandard = /^<@\d+>$/
const discordMentionedUserRegexExclamation = /^<@!\d+>$/

export default function (input : string) : string {
    if(discordMentionedUserRegexStandard.test(input)) return input.slice(2, input.length - 1)
    if(discordMentionedUserRegexExclamation.test(input)) return input.slice(3, input.length - 1)
    return input
}