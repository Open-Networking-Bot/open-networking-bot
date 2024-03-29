import { Message } from "discord.js";
import database from "../../functions/core/database";
import { AccessLevels } from "../../functions/models/accessLevels";
import config from "../../functions/models/config";
import authenticate from "../../functions/util/authenticate";
import dmUser from "../../functions/util/dmUser";
import { getAllLiveMembers } from "../events/list";

/**
 * @author Lewis Page
 * @description When the `$livemembers` command is run, a list of every live member is DMed to the person.
 * @param message The Discord Message, sent.
 */
export default async function liveMembersCommand(message : Message){
    const fields = []

    const liveMembers = await getAllLiveMembers()
    const allMemebers = await database.members.findMany({where: {serverId: config.server_id}})

    for(let member of liveMembers){
        const databaseMember = allMemebers.find(i => i.discordID === member.id)
        if(!databaseMember || !databaseMember.url) continue;

        const nameToCall = !!member.nickname ? member.nickname : databaseMember.name
        const isFeatured = member.roles.cache.some(role => config.priority_event_roles.some(x => role.id === x))

        fields.push({
            name: `${nameToCall}${isFeatured ? " (2 Points)" : ""}`,
            value: `<https://www.twitch.tv/${databaseMember.url}>`,
            sortingOrder: isFeatured ? 1 : 0
        })
    }

    await dmUser(message.member!,{
        embeds: [
            {
                "title": `Who is live?`,
                "description": `Here is everyone who is live in the server:`,
                "color": 0x7300bf,
                "fields": fields.sort((a, b) => b.sortingOrder - a.sortingOrder),
                "footer": {
                    "text": `If you want to appear on this list, make sure you have used the $link command!`
                }
            }
        ]
    },message)
}