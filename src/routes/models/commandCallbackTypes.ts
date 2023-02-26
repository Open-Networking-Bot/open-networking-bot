import { Message } from "discord.js";
import Monad from "../../functions/models/Monad";
import AbstractedCommand from "./AbstractedCommand";

export type legacyCallback = (message : Message, content : string[]) => any
export type callback = (command : AbstractedCommand) => any