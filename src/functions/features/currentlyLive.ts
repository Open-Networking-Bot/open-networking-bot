import {Message} from "discord.js";

let currentlyLiveMessages : Message[] = []

/**
 * @author Lewis Page
 * @description Adds a Discord Message to the list of `currentyLiveMessages`
 * @param msg The Discord Message, sent.
 */
export function add(msg : Message){ currentlyLiveMessages.push(msg) }

/**
 * @author Lewis Page
 * @description Removes a Discord Message from the list of `currentyLiveMessages`
 * @param msg The Discord Message, deleted.
 */
export function remove(msg : Message) { currentlyLiveMessages = currentlyLiveMessages.filter(message => message !== msg) }

/**
 * @author Lewis Page
 * @description Gives all the messages currently indicating that a member is live.
 * @returns All the messages, indicating that a member is currently live.
 */
export function get() { return currentlyLiveMessages }