import {Message, PartialMessage} from "discord.js";
import * as whoISupported from "../controllers/supported/whoISupported";
import * as expressSupport from "../controllers/supported/expressSupport";
import * as shoutOutSupport from "../controllers/supported/shoutOutSupport"
import config from "../functions/models/config";
import {add} from "../functions/features/currentlyLive";
import addToExpressAutomatic from "../controllers/express/addToExpressAutomatic";
import {New, Updated} from "../controllers/supported/supportUpdating"
import * as inviteSupport from "../controllers/supported/inviteSupport"

export async function NoUpdate(message : Message<boolean>){

    if(message.author.bot) return;

    switch (message.channelId){
        case config.who_i_supported_channel: New(message, whoISupported.handleAddition, whoISupported.specialTagCalculation); break;
        case config.express_support_channel: New(message, expressSupport.handleAddition); break;
        case config.request_a_slot_channel: await addToExpressAutomatic(message); break;
        case config.shout_out_support_channel: New(message, shoutOutSupport.handleAddition); break;
        case config.who_invited_me_channel: inviteSupport.New(message); return;
    }
    if(config.raid_message_channels.some(msg => msg === message.channelId)) add(message);
}
export async function Update(oldMessage : Message | PartialMessage, message : Message | PartialMessage){
    switch (message.channelId){
        case config.who_i_supported_channel: Updated(oldMessage, message, whoISupported.handleAddition, whoISupported.specialTagCalculation); break;
        case config.express_support_channel: Updated(oldMessage, message, expressSupport.handleAddition); break;
        case config.shout_out_support_channel: Updated(oldMessage, message, shoutOutSupport.handleAddition); break;
        case config.who_invited_me_channel: inviteSupport.Updated(oldMessage, message); return;
    }
}