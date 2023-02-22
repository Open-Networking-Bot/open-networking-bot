import { TextChannel } from "discord.js";
import fs from "fs";
import { join } from "path";
import config from "../../functions/models/config";
import database from "../../functions/core/database";
import client from "../../functions/core/serverInit";
import { logMessage, logType } from "../logging/loggingManager";
import { Clamp } from "./expressSupport";
import { getTodaysSupportEntry } from "./supportQueries";
import { specialTagCalculation } from "./whoISupported";
import parseSeveralMentionedUsers from "../../functions/validation/parseSeveralMentionedUsers";

export const TERMINATION_DETAILS_PATH = join("data", "termination_details")

export default async function () {
    const path = join(__dirname, "..", "..", TERMINATION_DETAILS_PATH)
    if (!fs.existsSync(path)) return;

    const dateOfTurnOff = new Date(fs.readFileSync(path, "utf-8"));

    const whoISupportedCache = (await (
    (client.channels.cache.find(i => i.id === config.who_i_supported_channel)) as TextChannel
    ).messages.fetch({ limit: config.catchup_message_cap }))
    .filter(i => dateOfTurnOff.getTime() < i.createdAt.getTime())

    const expressSupportCache = (await (
        (await client.channels.fetch(
            config.express_support_channel
        )) as TextChannel
        ).messages.fetch({ limit: config.catchup_message_cap }))
        .filter(i => dateOfTurnOff.getTime() < i.createdAt.getTime())

    const shoutOutSupportCache = (await (
        (await client.channels.fetch(
            config.shout_out_support_channel
        )) as TextChannel
        ).messages.fetch({ limit: config.catchup_message_cap }))
        .filter(i => dateOfTurnOff.getTime() < i.createdAt.getTime())

    for (let message of whoISupportedCache) {
        const content = parseSeveralMentionedUsers(message[1].content)
        if (!content) continue;

        const member = await database.members.findFirst({
        where: { discordID: message[1].author.id },
        });
        if (!member) continue;

        const supportEntry = await getTodaysSupportEntry(member);

        await database.support.update({
        where: { id: supportEntry.id },
        data: {
            whoISupported: supportEntry.whoISupported + specialTagCalculation(content),
        },
        });
    }

    for (let message of expressSupportCache) {
        const content = parseSeveralMentionedUsers(message[1].content);
        if (!content) continue;

        const member = await database.members.findFirst({
        where: { discordID: message[1].author.id },
        });
        if (!member) continue;

        const supportEntry = await getTodaysSupportEntry(member);
        const pointsAwarded =
        config.express_clamp_type === "database"
            ? await Clamp(content.length, member)
            : content.length;

        await database.support.update({
            where: { id: supportEntry.id },
            data: { expressSupport: supportEntry.expressSupport + pointsAwarded },
        });
    }

    for (let message of shoutOutSupportCache) {
        const content = parseSeveralMentionedUsers(message[1].content)
        if (!content) continue;

        const member = await database.members.findFirst({
        where: { discordID: message[1].author.id },
        });
        if (!member) continue;

        const supportEntry = await getTodaysSupportEntry(member);

        await database.support.update({
        where: { id: supportEntry.id },
        data: {
            shoutOutSupport: supportEntry.shoutOutSupport + content.length,
        },
        });
    }

    await logMessage("The server has now finished playing catchup")
}