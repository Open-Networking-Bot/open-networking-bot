import config from "./config"

const NUMBER_OF_ACCESS_LEVELS = 6

export enum AccessLevels{
    Raid = 1,
    Initiation = 1<<1,
    Moderation = 1<<2,
    Express = 1<<3,
    Council = 1<<4,
    Shoutout = 1<<5
}

export function SeperateAccessLevels(combined : number){
    const result = []
    for(let i = 0; i < NUMBER_OF_ACCESS_LEVELS; i++){
        const bitshift = 1<<i
        if((combined & bitshift) !== 0) result.push(bitshift)
    }

    return result
}

export function AccessLevelsToPermittedIDs(accessLevels : AccessLevels[]){
    const result = []
    for(let accessRole of config.command_access_roles){
        for(let level of accessLevels){
            if((accessRole.access_level & level) !== 0) result.push(accessRole.id)
        }
    }
    return result
}

export function AccessLevelNumberToPermittedIDs(accessLevels : number){
    const result = []
    for(let accessRole of config.command_access_roles){
        if((accessRole.access_level & accessLevels) !== 0) result.push(accessRole.id)
    }
    return result
}

export function AccessLevelNumberToPermittedID(accessLevels : number){
    const result = []
    for(let accessRole of config.command_access_roles){
        if(accessRole.access_level === accessLevels) result.push(accessRole.id)
    }
    return result
}