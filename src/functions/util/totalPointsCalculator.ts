import config from "../models/config";

export default (raidPoints : number, whoISupportedTags : number, expressTags : number, shoutOutTags : number, inviteTags : number) =>
                    ((expressTags * config.points_awarded_for_activities.express_support)
                    + (whoISupportedTags * config.points_awarded_for_activities.who_I_supported)
                    + (shoutOutTags * config.points_awarded_for_activities.shout_out_support)
                    + (inviteTags * config.points_awarded_for_activities.invited_support)
                    + (raidPoints))