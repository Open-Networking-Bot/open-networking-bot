import { Message } from "discord.js";
import { logMessage, logType } from "../../controllers/logging/loggingManager";

/** The total weight of each of the infractions, which is needed to trigger the system. */
const TOLERATED_WEIGHT = 6

/** The tests, which can trip the system */
const TESTS = [
    {injection: /--/, weight: 4},
    {injection: /;/, weight: 3},
    {injection: /1=1/, weight: 4},
    {injection: / or /, weight: 1},
    {injection: / select /, weight: 3},
    {injection: / drop /, weight: 3},
    {injection: / table /, weight: 2},
    {injection: /['"]/, weight: 1},
]

/**
 * Detects if a message may be an SQL Injection Attack. If so, the message will be replied to, and a log made.
 * @author Lewis Page
 * @param message The Discord message to verify
 * @returns If an SQL Vunerability was found.
 */
export default async function detectSQLInjection(message : Message){
    const testData = message.content.toLowerCase()

    let currentWeight = 0
    for(let test of TESTS){
        if(test.injection.test(testData)) currentWeight += test.weight
    }

    if(TOLERATED_WEIGHT <= currentWeight){
        await message.reply("⚠️ The bot found a problem with your query.")
        const replyMessage = `<@&880214274314764295>, the bot has reasonable suspicion that <@${message.author.id}> has attempted an SQL Injection Attack on the Shadow Stream Supporters Discord Server.`
        + ` This is due to the bot command, \`${message.content}\` being executed. If you believe this warning to be legitamate, the member in question should be sanctioned immediately`
        await logMessage(replyMessage, logType.critical)
        return true
    }
    return false
}