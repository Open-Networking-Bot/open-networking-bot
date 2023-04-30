/**
 * @author Lewis Page
 * @description Converts a 2D array to a string, in CSV formatting.
 * @param data The 2D array to convert.
 * @returns The final CSV String
 */
export default function csvMaker(data : any[][]){
    let finalFile : string = ""
    for (let line in data){
        for (let entry of data[line]){
            if(finalFile.match(","))
                finalFile += `"${(entry !== null ? entry.toString() : "null")}",`
            else
                finalFile += `${(entry !== null ? entry.toString() : "null")},`
        }
        finalFile = finalFile.slice(0,finalFile.length - 1)
        finalFile += "\n"
    }
    return finalFile
}