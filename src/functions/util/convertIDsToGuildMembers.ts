import { Guild, GuildMember } from "discord.js";
import client from "../core/serverInit";
import config from "../models/config";
import { memberHasRoles } from "./memberHasRole";

/**
 * @author Lewis Page
 * @description Converts a list of Discord IDs to GuildMembers
 * @param ids the Discord IDs to convert
 * @returns a list of all the GuildMembers, found
 */
export default function convertIDsToGuildMembers(ids : string[]){
    const guild = client.guilds.cache.find(i => i.id === config.server_id)!
    return ids.map(id => guild.members.cache.find(member => member.id === id)).filter(m => !!m) as GuildMember[]
}