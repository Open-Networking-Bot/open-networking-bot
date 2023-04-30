import fs from "fs"
import path from "path";
import rootDir from "../util/rootDir";
import yaml from "yaml"

/**
 * @interface
 * @author Lewis Page
 * @description Defines any command/command related object which can be described.
 */
export interface IDescribable {
    name: string,
    id: string,
    desc: string,
    access_level: number | null
}

/**
 * @interface
 * @extends IDescribable
 * @author Lewis Page
 * @description Defines the structure of a Command object.
 */
export interface Command extends IDescribable {
    args: {required : boolean | undefined, name : string, desc: string, type: string}[] | null
}

/**
 * @interface
 * @extends IDescribable
 * @author Lewis Page
 * @description Defines the structure of a Command Category object.
 */
export interface CommandCategory extends IDescribable {
    commands: Command[]
}

/**
 * @typedef
 * @author Lewis Page
 * @description Defines what the structure of `commands.yaml` should look like.
 */
type commandFileLayout = {
    commands: Command[],
    command_categories: CommandCategory[]
}

const text = fs.readFileSync(path.join(rootDir,"config","commands.yaml"), "utf-8")
const yamlParsed = yaml.parse(text) as commandFileLayout

const helpCommandsObject = {
    ...yamlParsed,
    /**
     * @author Lewis Page
     * @description Gets a command, which is on the bot.
     * @param name The command's name
     * @param useCommandCategories If command categories should be scanned through as well. Set to `true` by default.
     * @returns The command, found, or `null`.
     */
    getCommand: function(name : string, useCommandCategories : boolean = true) : Command | null {
        for(let command of this.commands) if(command.name === name) return command

        if(useCommandCategories)
            for(let commandCategory of this.command_categories)
                for(let command of commandCategory.commands)
                    if(command.name === name) return command
        
        return null
    },

    /**
     * @author Lewis Page
     * @description Gets a command category, which is in the bot.
     * @param name The command category's name.
     * @returns The command category, found, or `null`.
     */
    getCommandCategory: function(name : string) : CommandCategory | null {
        for(let commandCategory of this.command_categories) if(commandCategory.name === name) return commandCategory
        return null
    },

    /**
     * @author Lewis Page
     * @description Gets a command category, which is in the bot. This is found from the ID of the category.
     * @param name The command category's ID.
     * @returns The command category, found, or `null`.
     */
    getCommandCategoryFromId: function(id : string) : CommandCategory | null {
        for(let commandCategory of this.command_categories)
            for(let command of commandCategory.commands)
                if(command.id === id)
                    return commandCategory
        return null
    },
    
    /**
     * @author Lewis Page
     * @description Finds similarly named commands to the input.
     * @param name The alledged name of the command, to get similar commands to.
     * @param maxLength The maximum length of how many similar commands to return. Infinite by default.
     * @param scanningLocations What places to scan for commands. Everywhere by default.
     * @returns A list, sorted by the probability that the name is a match.
     */
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