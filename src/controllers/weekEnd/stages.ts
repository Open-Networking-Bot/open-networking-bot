import { Message } from "discord.js";
import { AccessLevels } from "../../functions/models/accessLevels";
import authenticate from "../../functions/util/authenticate";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import { logMessage } from "../logging/loggingManager";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Handles the `$week stage` command; changes weeks of inactivity in the database.
 * @param message The Discord Message, sent.
 * @param content The Message Content, split by spaces.
 * @returns A Message Reply Promise.
 */
export default async function weekStageController(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 4) || authenticate(message, AccessLevels.Admin)) return;

    const stage = parseInt(content[3])
    if(isNaN(stage) || stage < 0 || stage > 3) return message.reply(messages.not_a_stage)

    const parsedUser = parseMentionedUser(content[2])
    const members = await database.members.updateMany({where: {discordID: parsedUser, serverId: config.server_id}, data: {weeksOfInactivity: stage}})
    if(members.count === 0) return message.reply(messages.no_user_error_third_person)

    logMessage(`${message.author.username} changed <@${parsedUser}>'s stage to ${stage}`)
    return message.reply(messages.changed_stage)
}