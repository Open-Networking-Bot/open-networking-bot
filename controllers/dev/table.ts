import { Message, MessageAttachment } from "discord.js";
import path from "path";
import database from "../../functions/core/database";
import messages from "../../functions/models/messages";
import rootDir from "../../functions/util/rootDir";
import requireContentLengthOf from "../../functions/validation/requireContentLengthOf";
import fs from "fs/promises";

export default async function(message : Message, content : string[]){
    if(await requireContentLengthOf(message, content, 3)) return;

    //@ts-ignore
    const table = database[content[2]]

    if(!table) return message.reply(messages.not_a_table)

    const filePath = path.join(rootDir, "data", "data.json")

    await fs.writeFile(filePath, JSON.stringify(await table.findMany()))

    await message.reply({files: [new MessageAttachment(filePath, `${content[2]}-${new Date().toISOString()}.json`)]})

    await fs.rm(filePath)
}