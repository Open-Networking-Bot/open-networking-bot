import fs from "fs"
import path from "path";
import rootDir from "../util/rootDir";
import yaml from "yaml"

type config = {
    "bot_command_character": string,
    "permitted_command_channels": string[],
    "raid_roles": string[],
    "command_access_roles": {access_level: number, id: string}[]
    "raid_voice_channel" : string,
    "raid_links_channel": string,
    "who_i_supported_channel" : string,
    "express_support_channel": string,
    "general_channel": string,
    "minimum_points_required_per_week": number,
    "points_awarded_for_activities": { "raids": number, "express_support": number, "who_I_supported": number, "shout_out_support": number, "invited_support": number },
    "raid_junkie_roles": string[],
    "raid_message_channels": string[],
    "exempt_roles": string[],
    "server_id": string,
    "minimum_points_required_for_express": number,
    "minimum_express_tags_required_for_express": number,
    "logging_channel": string,
    "on_leave_role": string,
    "message_to_go_on_leave": string,
    "channel_to_go_on_leave": string,
    "emote_id_to_go_on_leave": string,
    "use_weekly_average": boolean,
    "weeks_for_average": number,
    "purge_date_limit": number,
    "maximum_express_tags": number,
    "express_clamp_type": "review" | "database" | "none",
    "express_max_slots": number,
    "request_a_slot_channel": string,
    "catchup_message_cap": number,
    "sss_discord_id": string,
    "sss_twitch_page_tag_multiplier": number,
    "shout_out_support_channel": string,
    "rules_and_how_it_works_channel": string,
    "raid_info_channel": string,
    "support_network_info_channel": string,
    "dm_for_failed_activity_check": boolean,
    "who_invited_me_channel": string,
    "time_between_message_history_save": number,
    "now_live_role": string,
    "now_live_eligibility_role": string,
    "super_featured_role": string,
    "super_featured_live_role": string,
    "new_member_role": string,
    "report_channel": string,
    "now_live_banned_roles": string[],
    "featured_member_tag_multiplier": number,
    "bot_version": string,
    "raid_exclusion_role" : string
}

const text = fs.readFileSync(path.join(rootDir,"config","config.yaml"), "utf-8")
const yamlParsed = yaml.parse(text) as config

export default yamlParsed