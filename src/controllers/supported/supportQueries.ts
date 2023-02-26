import {members} from ".prisma/client";
import database from "../../functions/core/database";
import { DAY } from "../../functions/core/magicNumbers";


export async function getTodaysSupportEntry(member : members){
    const supportEntries = await (await database.support.findMany({where: {membersId: member.id}}))
    if(!supportEntries || supportEntries.length === 0) return await database.support.create({data: {
            member: {connect: {id: member.id}},
            whoISupported: 0,
            expressSupport: 0,
            shoutOutSupport: 0,
            inviteSupport: 0,
            date: new Date()
        }});

    const sortedEntries = supportEntries.sort((a,b)=> (b.date.getTime() - a.date.getTime()))
    const latest = sortedEntries[0]
    if(latest.date.getDate() === new Date().getDate()) return latest;
    return await database.support.create({data: {
            member: {connect: {id: member.id}},
            whoISupported: 0,
            expressSupport: 0,
            shoutOutSupport: 0,
            inviteSupport: 0,
            date: new Date()
        }});
}

export async function collectXDaysOfSupportEntries(days : number, member : members){
    const supportEntries = await database.support.findMany({where: {membersId: member.id}})
    if(!supportEntries) return [];

    return supportEntries.filter(entry => entry.date.getTime() > new Date().getTime() - (DAY * days))
}