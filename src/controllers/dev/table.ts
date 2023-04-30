import { Message, MessageAttachment } from "discord.js";
import path from "path";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import rootDir from "../../functions/util/rootDir";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import fs from "fs/promises";
import config from "../../functions/models/config";

/**
 * @author Lewis Page
 * @description Pulls a table from the database, when the `$dev table` command is invoked
 * @param message The Discord Message
 * @param content The Message's content, split by spaces.
 * @returns A message reply promise, or undefined
 */
export default async function devTable(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    //@ts-ignore
    const table = database[content[2]]

    if(!table) return message.reply(messages.not_a_table)

    const filePath = path.join(rootDir, "data", "data.json")

    await fs.writeFile(filePath, JSON.stringify(await table.findMany({where: {serverId: config.server_id}})))

    await message.reply({files: [new MessageAttachment(filePath, `${content[2]}-${new Date().toISOString()}.json`)]})

    await fs.rm(filePath)
}