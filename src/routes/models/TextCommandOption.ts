import { GuildMember } from "discord.js"

export type keyValuePair<T> = {key : string, val : T}

export default class TextCommandOption {
    private members : keyValuePair<GuildMember>[] = []
    private numbers : keyValuePair<number>[] = []
    private integers : keyValuePair<number>[] = []
    private strings : keyValuePair<string>[] = []
    private booleans : keyValuePair<boolean>[] = []

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

    getMember(key : string){
        for(let i of this.members) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    getNumber(key : string){
        for(let i of this.numbers) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    getString(key : string){
        for(let i of this.strings) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    getBoolean(key : string){
        for(let i of this.booleans) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }

    getInteger(key : string){
        for(let i of this.integers) if(i.key === key) return i.val
        throw new Error("Key not found.")
    }
}