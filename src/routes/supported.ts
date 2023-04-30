import {Message, PartialMessage} from "discord.js";
import * as whoISupported from "../controllers/supported/whoISupported";
import * as calendarSupport from "../controllers/supported/calendarSupport";
import * as shoutOutSupport from "../controllers/supported/shoutOutSupport"
import config from "../functions/models/config";
import {add} from "../functions/features/currentlyLive";
import addToCalendarAutomatic from "../controllers/calendar/addToCalendarAutomatic";
import {New, Updated} from "../controllers/supported/supportUpdating"
import * as inviteSupport from "../controllers/supported/inviteSupport"

/**
 * @author Lewis Page
 * @description Handles when a support post is created.
 * @param message The Discord Message, sent.
 */
export async function NoUpdate(message : Message<boolean>){

    if(message.author.bot) return;

    switch (message.channelId){
        case config.who_i_supported_channel: New(message, whoISupported.handleAddition, whoISupported.specialTagCalculation); break;
        case config.calendar_support_channel: New(message, calendarSupport.handleAddition); break;
        case config.request_a_slot_channel: await addToCalendarAutomatic(message); break;
        case config.shout_out_support_channel: New(message, shoutOutSupport.handleAddition); break;
        case config.who_invited_me_channel: inviteSupport.New(message); return;
    }
    if(config.event_message_channels.some(msg => msg === message.channelId)) add(message);
}

/**
 * @author Lewis Page
 * @description Handles when a support post is updated.
 * @param oldMessage The message before the update.
 * @param message The message after the update.
 */
export async function Update(oldMessage : Message | PartialMessage, message : Message | PartialMessage){
    switch (message.channelId){
        case config.who_i_supported_channel: Updated(oldMessage, message, whoISupported.handleAddition, whoISupported.specialTagCalculation); break;
        case config.calendar_support_channel: Updated(oldMessage, message, calendarSupport.handleAddition); break;
        case config.shout_out_support_channel: Updated(oldMessage, message, shoutOutSupport.handleAddition); break;
        case config.who_invited_me_channel: inviteSupport.Updated(oldMessage, message); return;
    }
}