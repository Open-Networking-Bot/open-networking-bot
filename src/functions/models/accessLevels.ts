import config from "./config"

const NUMBER_OF_ACCESS_LEVELS = 6

/**
 * @enum
 * @author Lewis Page
 * @description An enum, allowing for the permitted users to run commands to be defined. Uses bitshifted values.
 */
export enum AccessLevels {
    Event = 1,
    Initiation = 1<<1,
    Moderation = 1<<2,
    Calendar = 1<<3,
    Admin = 1<<4,
    Shoutout = 1<<5
}

/**
 * @author Lewis Page
 * @description Seperated several combined AccessLevels into their individual enum values.
 * @param combined The number, defining several access levels.
 * @returns An array, of seperated access levels.
 */
export function SeperateAccessLevels(combined : number){
    const result = []
    for(let i = 0; i < NUMBER_OF_ACCESS_LEVELS; i++){
        const bitshift = 1<<i
        if((combined & bitshift) !== 0) result.push(bitshift)
    }

    return result as AccessLevels[]
}

/**
 * @author Lewis Page
 * @description Converts a list of access levels to the Discord IDs of the roles being referenced
 * @param accessLevels A list of access levels, to be converted.
 * @returns A list of Discord IDs, permitted to run the command.
 */
export function AccessLevelsToPermittedIDs(accessLevels : AccessLevels[]){
    const result = []
    for(let accessRole of config.command_access_roles){
        for(let level of accessLevels){
            if((accessRole.access_level & level) !== 0) result.push(accessRole.id)
        }
    }
    return result
}

/**
 * @author Lewis Page
 * @description Converts a combined access level to to the Discord IDs of the roles being referenced
 * @param accessLevels The combined access level, to be converted.
 * @returns A list of Discord IDs, permitted to run the command.
 */
export function AccessLevelNumberToPermittedIDs(accessLevels : number){
    const result = []
    for(let accessRole of config.command_access_roles){
        if((accessRole.access_level & accessLevels) !== 0) result.push(accessRole.id)
    }
    return result
}