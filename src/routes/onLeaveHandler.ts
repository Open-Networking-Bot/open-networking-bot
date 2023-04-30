import {GuildMember, PartialGuildMember} from "discord.js";
import config from "../functions/models/config";
import exitOnLeave from "../controllers/onLeave/exitOnLeave";
import goOnLeave from "../controllers/onLeave/goOnLeave";

/**
 * @author Lewis Page
 * @description Handles when people come on/off On Leave.
 * @param oldMember The member's object before the role change.
 * @param newMember The member's object after the role change.
 */
export default async function onLeaveHandler(oldMember : GuildMember | PartialGuildMember, newMember : GuildMember){
    if(oldMember.roles.cache.has(config.on_leave_role) && !newMember.roles.cache.has(config.on_leave_role))
        await exitOnLeave(newMember)
    else if(!oldMember.roles.cache.has(config.on_leave_role) && newMember.roles.cache.has(config.on_leave_role))
        await goOnLeave(newMember)
}