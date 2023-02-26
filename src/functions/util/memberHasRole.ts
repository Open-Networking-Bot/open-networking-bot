import { GuildMember } from "discord.js";

/**
 * @author Lewis Page
 * @description Checks wether a member has a specified role
 * @param member the GuildMember to check roles for
 * @param roleId the Role ID to check for
 * @returns Wether the member has the specified role
 */
export function memberHasRole(member : GuildMember, roleId : string){
    return member.roles.cache.some(x => x.id === roleId)
}

/**
 * @author Lewis Page
 * @description Checks wether a member has one of several specified roles
 * @param member the GuildMember to check roles for
 * @param roleIds the Role IDs to check for
 * @returns Wether the member has one of the specified roles
 */
export function memberHasRoles(member : GuildMember, roleIds : string[]){
    return member.roles.cache.some(x => roleIds.some(y => x.id === y))
}