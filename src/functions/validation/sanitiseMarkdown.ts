type comparisonRecord = {original: RegExp, new: string}

const CHARACTERS_TO_SANITISE : comparisonRecord[] = [
    {original: /\_/g, new: "_"}, 
    {original: /\*/g, new: "*"}, 
    {original: /\|/g, new: "|"}, 
    {original: /\~/g, new: "~"}, 
]

export default function(str : string){
    let output = str
    for(let character of CHARACTERS_TO_SANITISE){
        output = output.replace(character.original, "\\" + character.new)
    }

    return output
}