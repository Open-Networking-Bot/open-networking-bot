import config from "../../functions/models/config";
import { IntervalInstance } from "../../functions/core/IntervalManager";
import { NOW_LIVE_ROLE_UPDATER } from "../../functions/core/intervalNames";
import { MINUTE, WEEK } from "../../functions/core/magicNumbers";
import client from "../../functions/core/serverInit";

/**
 * @author Lewis Page
 * @description Automatically applies Now Live or Super Featured Live to anyone who meets the criteria.
 */
async function updateRoles(){
    const guild = await client.guilds.fetch(config.server_id)
    const members = guild.members.cache.map(i => i)
    const todo : Promise<any>[] = []
    
    for(let member of members){
        
        const isStreaming = !member.presence ? false : member.presence!.activities.map(i => i.type).includes("STREAMING")
        const hasSuperFeaturedRole = !!member.roles.cache.find(i => i.id === config.super_featured_role)

        if(!hasSuperFeaturedRole){
            let hasLiveRole : boolean = false
            let hasEligiblityRole : boolean = false
            let hasSupportBan : boolean = false

            for(let i of member.roles.cache){
                const role = i[1].id
                if(!hasLiveRole) hasLiveRole = role === config.now_live_role
                if(!hasEligiblityRole) hasEligiblityRole = role === config.now_live_eligibility_role || !!config.priority_event_roles.find(x => role === x)
                if(!hasSupportBan) hasSupportBan = !!config.now_live_banned_roles.find(x => role === x)
            }

            if(hasLiveRole && (hasSupportBan || !isStreaming)) todo.push(member.roles.remove(config.now_live_role))
            else if(!hasLiveRole && isStreaming && hasEligiblityRole && !hasSupportBan) todo.push(member.roles.add(config.now_live_role))
            continue
        }

        const hasSuperFeaturedLiveRole = !!member.roles.cache.find(i => i.id === config.super_featured_live_role)
        
        if(hasSuperFeaturedLiveRole && !isStreaming) todo.push(member.roles.remove(config.super_featured_live_role))
        else if(!hasSuperFeaturedLiveRole && isStreaming) todo.push(member.roles.add(config.super_featured_live_role))
    }

    await Promise.resolve(todo)
}

/**
 * @namespace
 * @author Lewis Page
 * @name Live_Role_Updater
 * @description Contains the information about adding roles when a member goes live.
 */
export default {
    name: NOW_LIVE_ROLE_UPDATER,
    interval: setInterval(updateRoles, MINUTE * 5)
} as IntervalInstance