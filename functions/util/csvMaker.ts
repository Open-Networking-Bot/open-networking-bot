export default function (data : any[][]){
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