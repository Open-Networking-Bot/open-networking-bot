import client from "../functions/core/serverInit";
import {newMemberAuto as joined} from "../controllers/initiation/joined";
import {leaveAuto as left} from "../controllers/initiation/left";
import {NoUpdate, Update} from "./supported";
import {remove} from "../functions/features/currentlyLive";
import {Message} from "discord.js";
import config from "../functions/models/config";
import onLeaveHandler from "./onLeaveHandler";
import * as expressSupport from "../controllers/supported/expressSupport"
import * as whoISupported from "../controllers/supported/whoISupported"
import * as shoutOutSupport from "../controllers/supported/shoutOutSupport"
import {Deleted as supportDeleted} from "../controllers/supported/supportUpdating"
import { Deleted } from "../controllers/supported/inviteSupport";
import { logMessage, logType } from "../controllers/logging/loggingManager";

const protectCommand = (command : (...args : any[]) => any) => (...message : any[]) => {
    try{
        command(...message)
    }
    catch(err){
        logMessage(err as string, logType.critical)
    }
}

client.on("guildMemberAdd",protectCommand(joined))
client.on("guildMemberRemove",protectCommand(left))
client.on("messageCreate", protectCommand(NoUpdate))
client.on("messageUpdate", protectCommand(Update))
client.on("messageDelete", protectCommand(message => {
    if(config.raid_message_channels.some(msg => msg === message.channelId)) return remove(message as Message);
    switch(message.channel.id){
        case config.express_support_channel: return supportDeleted(message, expressSupport.handleSubtraction);
        case config.who_i_supported_channel: return supportDeleted(message, whoISupported.handleSubtraction, whoISupported.specialTagCalculation);
        case config.shout_out_support_channel: return supportDeleted(message, shoutOutSupport.handleSubtraction)
        case config.who_invited_me_channel: return Deleted(message)
        default: return;
    }
}))
client.on("guildMemberUpdate", protectCommand(onLeaveHandler))