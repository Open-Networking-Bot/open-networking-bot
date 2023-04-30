import { GuildMember } from "discord.js"

/**
 * @typedef
 * @author Lewis Page
 * @description Acts as a basic string to `T` value pair.
 */
export type keyValuePair<T> = {key : string, val : T}

/**
 * @class
 * @author Lewis Page
 * @description Allows for command options to be passed to a modern controller, despite a legacy command input being used.
 */
export default class TextCommandOption {
    private members : keyValuePair<GuildMember>[] = []
    private numbers : keyValuePair<number>[] = []
    private integers : keyValuePair<number>[] = []
    private strings : keyValuePair<string>[] = []
    private booleans : keyValuePair<boolean>[] = []

    /**
     * @author Lewis Page
     * @constructor
     * @param members All the member options given from the user.
     * @param numbers All the numberic options given by the user.
     * @param integers All the integer options given by the user.
     * @param strings All the string options given by the user.
     * @param booleans All the boolean options given by the user.
     */
    constructor(members : keyValuePair<GuildMember>[],
         numbers : keyValuePair<number>[],
          integers : keyValuePair<number>[],
           strings : keyValuePair<string>[],
            booleans : keyValuePair<boolean>[]) {
        this.members = members
        this.numbers = numbers
        this.integers = integers
        this.strings = strings
        this.booleans = booleans
    }

    /**
     * @author Lewis Page
     * @description Gets a member option, from the key specified.
     * @param key The ID of the command option, wanted.
     * @returns The command option, given.
     */
    getMember(key : string){
        for(let i of this.members) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    /**
     * @author Lewis Page
     * @description Gets a number option, from the key specified.
     * @param key The ID of the command option, wanted.
     * @returns The command option, given.
     */
    getNumber(key : string){
        for(let i of this.numbers) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    /**
     * @author Lewis Page
     * @description Gets a string option, from the key specified.
     * @param key The ID of the command option, wanted.
     * @returns The command option, given.
     */
    getString(key : string){
        for(let i of this.strings) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    /**
     * @author Lewis Page
     * @description Gets a boolean option, from the key specified.
     * @param key The ID of the command option, wanted.
     * @returns The command option, given.
     */
    getBoolean(key : string){
        for(let i of this.booleans) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    /**
     * @author Lewis Page
     * @description Gets a integer option, from the key specified.
     * @param key The ID of the command option, wanted.
     * @returns The command option, given.
     */
    getInteger(key : string){
        for(let i of this.integers) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }
}