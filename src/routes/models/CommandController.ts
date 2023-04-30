import Monad from "../../functions/models/Monad";
import { callback, legacyCallback } from "./commandCallbackTypes";

/**
 * @class
 * @author Lewis Page
 * @description Contains the information related to a command, and what it should do when run.
 */
export default class CommandController {

    id : string
    onCommandInvoke : Monad<callback, legacyCallback>

    /**
     * @constructor
     * @author Lewis Page
     * @param id The command's ID, as referenced in `config/commands.yaml`.
     * @param onCommandInvoke The controller for the command.
     */
    constructor(id : string, onCommandInvoke : Monad<callback, legacyCallback>){
        this.id = id
        this.onCommandInvoke = onCommandInvoke
    }
}