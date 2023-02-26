import config from "../../functions/models/config";
import { IntervalInstance } from "../../functions/core/IntervalManager";
import { REMOVE_NEW_ROLE } from "../../functions/core/intervalNames";
import { DAY, WEEK } from "../../functions/core/magicNumbers";
import client from "../../functions/core/serverInit";

export default {
    name: REMOVE_NEW_ROLE,
    interval: setInterval(async ()=>{
        const guild = await client.guilds.fetch(config.server_id)
        const members = guild.members.cache.map(i => i)
        
        const membersOver2WeeksWithRole = members.filter(i => !!i.joinedAt 
            && i.joinedAt.getTime() < new Date().getTime() - (WEEK * 2) 
            && !!i.roles.cache.find(x => x.id === config.new_member_role))
        const todo = membersOver2WeeksWithRole.map(i => i.roles.remove(config.new_member_role))
        await Promise.resolve(todo)
    }, DAY)
} as IntervalInstance