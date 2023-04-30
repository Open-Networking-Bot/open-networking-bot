import { TextChannel } from "discord.js";
import fs from "fs";
import { join } from "path";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import client from "../../functions/core/serverInit";
import { logMessage, logType } from "../logging/loggingManager";
import { Clamp } from "./calendarSupport";
import { specialTagCalculation } from "./whoISupported";
import parseSeveralMentionedUsers from "../../functions/validation/parseSeveralMentionedUsers";
import { SupportTypes } from "../../functions/models/supportTypes";
import addSupport from "./addSupport";
import { members } from "@prisma/client";
import root from "../../functions/util/rootDir";

export const TERMINATION_DETAILS_PATH = join("data", "termination_details")

/**
 * @author Lewis Page
 * @description When the server loads, the catchup function runs. This tries to recover any data which was lost due to the server being down.
 */
export default async function catchup() {
    const path = join(root, TERMINATION_DETAILS_PATH)
    if (!fs.existsSync(path)) return;

    const dateOfTurnOff = new Date(fs.readFileSync(path, "utf-8"));
    
    const addPointsForCategory = async (channelId : string, supportType : SupportTypes, tagCalculator :
         (content : string[], member : members) => Promise<number> | number) => {
        const cache = (await (
            (await client.channels.fetch(
                channelId
            )) as TextChannel
            ).messages.fetch({ limit: config.catchup_message_cap }))
            .filter(i => dateOfTurnOff.getTime() < i.createdAt.getTime())
        
        for (let message of cache) {
            const content = parseSeveralMentionedUsers(message[1].content)
            if (!content) continue;
    
            const member = await database.members.findFirst({
                where: { discordID: message[1].author.id, serverId: config.server_id },
            });
            if (!member) continue;
    
            await addSupport(supportType, await tagCalculator(content, member), member.id)
        }
    }

    await addPointsForCategory(config.who_i_supported_channel, SupportTypes.support, specialTagCalculation)

    await addPointsForCategory(config.calendar_support_channel, SupportTypes.calendar, async (content, member) =>
        config.calendar_clamp_type === "database"
            ? await Clamp(content.length, member!)
            : content.length
    )

    await addPointsForCategory(config.shout_out_support_channel, SupportTypes.shoutout, content => content.length)

    await addPointsForCategory(config.who_invited_me_channel, SupportTypes.invite, content => content.length)

    

    await logMessage("The server has now finished playing catchup")
}