import {Message} from "discord.js";

let currentlyLiveMessages : Message[] = []

export function add(msg : Message){ currentlyLiveMessages.push(msg) }
export function remove(msg : Message) { currentlyLiveMessages = currentlyLiveMessages.filter(message => message !== msg) }
export function get() { return currentlyLiveMessages }