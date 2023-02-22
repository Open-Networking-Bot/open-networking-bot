import { Message } from "discord.js";
import Monad from "../../functions/models/Monad";
import { callback, legacyCallback } from "./commandCallbackTypes";

export default class CommandController{

    id : string
    onCommandInvoke : Monad<callback, legacyCallback>

    constructor(id : string, onCommandInvoke : Monad<callback, legacyCallback>){
        this.id = id
        this.onCommandInvoke = onCommandInvoke
    }
}