import database from "../core/database";

/**
 * @author Lewis Page
 * @description Modified any beenRaided rows, to reflect on a URL change.
 * @param oldUrl The URL to look for in beenRaided
 * @param newUrl The URL to change any records to
 */
export default async function autocorrectURLChange(oldUrl : string, newUrl : string){
    await database.beenRaided.updateMany({where: {url: oldUrl}, data: {url: newUrl}})
}