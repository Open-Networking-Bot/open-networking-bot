import { Message, MessageAttachment } from "discord.js";
import path from "path";
import database from "../../functions/core/database";
import client from "../../functions/core/serverInit";
import config from "../../functions/models/config";
import fs from "fs/promises"
import rootDir from "../../functions/util/rootDir";

export default async function(message : Message){
    const discordMembers = (await client.guilds.fetch(config.server_id)).members.cache
    const databaseMembers = await database.members.findMany()

    const notInDatabase = discordMembers.map(member => {return {name: member.user.username, id: member.id}}).filter(member => {
        for(let databaseMember of databaseMembers){
            if(databaseMember.discordID === member.id) return false
        }
        return true
    })

    const notInServer = databaseMembers.map(member => {return {name: member.name, id: member.discordID}}).filter(member => {
        for(let discordMember of discordMembers){
            if(discordMember[1].id === member.id) return false
        }
        return true
    })
    
    const filePath = path.join(rootDir, "data", "data.json")

    await fs.writeFile(filePath, JSON.stringify({notInDatabase: notInDatabase, notInServer: notInServer}))

    await message.reply({files: [new MessageAttachment(filePath, `crossref_report-${new Date().toISOString()}.json`)]})

    await fs.rm(filePath)
}