import {GuildMember, PartialGuildMember} from "discord.js";
import config from "../functions/models/config";
import exitOnLeave from "../controllers/onLeave/exitOnLeave";
import goOnLeave from "../controllers/onLeave/goOnLeave";

export default async function (oldMember : GuildMember | PartialGuildMember, newMember : GuildMember){
    if(oldMember.roles.cache.has(config.on_leave_role) && !newMember.roles.cache.has(config.on_leave_role))
        await exitOnLeave(newMember)
    else if(!oldMember.roles.cache.has(config.on_leave_role) && newMember.roles.cache.has(config.on_leave_role))
        await goOnLeave(newMember)
}