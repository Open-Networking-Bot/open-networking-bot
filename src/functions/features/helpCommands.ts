import fs from "fs"
import path from "path";
import rootDir from "../util/rootDir";
import yaml from "yaml"

export interface IDescribable {
    name: string,
    id: string,
    desc: string,
    access_level: number | null
}

export interface Command extends IDescribable {
    args: {required : boolean | undefined, name : string, desc: string, type: string}[] | null
}

export interface CommandCategory extends IDescribable {
    commands: Command[]
}

type commandFileLayout = {
    commands: Command[],
    command_categories: CommandCategory[]
}

const text = fs.readFileSync(path.join(rootDir,"config","commands.yaml"), "utf-8")
const yamlParsed = yaml.parse(text) as commandFileLayout

const helpCommandsObject = {
    ...yamlParsed,
    getCommand: function(name : string, useCommandCategories : boolean = true) : Command | null {
        for(let command of this.commands) if(command.name === name) return command

        if(useCommandCategories)
            for(let commandCategory of this.command_categories)
                for(let command of commandCategory.commands)
                    if(command.name === name) return command
        
        return null
    },
    getCommandCategory: function(name : string) : CommandCategory | null {
        for(let commandCategory of this.command_categories) if(commandCategory.name === name) return commandCategory
        return null
    },

    getCommandCategoryFromId: function(id : string) : CommandCategory | null {
        for(let commandCategory of this.command_categories)
            for(let command of commandCategory.commands)
                if(command.id === id)
                    return commandCategory
        return null
    },
    
    getSimilarCommands: function(name : string, maxLength : number = 9999999, scanningLocations : IDescribable[][] | null = null) : IDescribable[] {
        const output : {matches: number, for: IDescribable}[] = []  
        if(scanningLocations === null) scanningLocations = [...this.command_categories.map(i => i.commands), this.command_categories, this.commands]

        const calculateMatch = (commandName : string) => {
            let currentStreak = 0
            let highestStreak = 0
            for(let i = 0; i < commandName.length; i++){
                if(name.length === i) break;
                if(commandName[i] === name[i]) {
                    currentStreak++
                    if(currentStreak > highestStreak) highestStreak = currentStreak
                }
                else{
                    currentStreak = 0
                }
            }
            return highestStreak
        }

        for(let commandArray of scanningLocations) 
            for(let command of commandArray)
                output.push({
                    matches: calculateMatch(command.name),
                    for: command
                })

        return output.sort((a, b)=>{
            if(a.matches === b.matches) return 0
            if(a.matches < b.matches) return 1
            else return -1
        }).slice(0, maxLength).map(i => i.for)
    },
    getRoot: function() : IDescribable[]{
        return [...this.command_categories, ...this.commands]
    }
}

export default helpCommandsObject