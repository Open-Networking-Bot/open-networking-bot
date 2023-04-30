import { Message } from "discord.js";
import AbstractedCommand from "./AbstractedCommand";

/**
 * @typedef
 * @author Lewis Page
 * @description A legacy callback is the controller layout for all commands created before ONB Version 1.0.0 It should not be used as is now unstable.
 */
export type legacyCallback = (message : Message, content : string[]) => any

/**
 * @typedef
 * @author Lewis Page
 * @description The layout of any modern commands, created after ONB Version 1.0.0
 */
export type callback = (command : AbstractedCommand) => any