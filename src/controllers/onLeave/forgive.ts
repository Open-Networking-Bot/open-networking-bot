import { Message } from "discord.js";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import parseMentionedUser from "../../functions/validation/parseMentionedUser";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";

/**
 * @author Lewis Page
 * @description Deletes the On Leave record for the member, specified in a discord message.
 * @param message The discord message, which was sent.
 * @param content message.content, split by spaces.
 * @returns The message reply promise.
 */
export default async function forgiveOnLeaveRecord(message : Message, content : string[]){

    // Tests if the message is long enough
    if(await requireContentLengthOf(message, content, 3)) return;

    // Find the specified member, stated in the message
    const memberId = parseMentionedUser(content[2])

    // Find the member in the database. If they cannot be found, return an error message.
    const member = await database.members.findFirst({where: {discordID: memberId}})
    if(!member) return message.reply(messages.no_user)

    // Delete the OnLeave record. If no record can be found, return an error message.
    const deletedRecords = await database.onLeave.deleteMany({where: {membersId: member.id}})
    if(deletedRecords.count < 1) return message.reply(messages.no_onleave_record)

    // Return a success message.
    return message.reply(messages.onleave_forgiven)
}