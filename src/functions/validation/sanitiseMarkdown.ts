/**
 * @typedef
 * @author Lewis Page
 * @description Holds what needs to be tested for markdown sanitation, and what to replace the illegal characters with.
 */
type comparisonRecord = {original: RegExp, new: string}

const CHARACTERS_TO_SANITISE : comparisonRecord[] = [
    {original: /\_/g, new: "_"}, 
    {original: /\*/g, new: "*"}, 
    {original: /\|/g, new: "|"}, 
    {original: /\~/g, new: "~"}, 
]

/**
 * @author Lewis Page
 * @description Sanitises any message sent, to prevent markdown from being triggered.
 * @param str The string to sanitise
 * @returns The sanitised string
 */
export default function sanitiseMarkdown(str : string){
    let output = str
    for(let character of CHARACTERS_TO_SANITISE){
        output = output.replace(character.original, "\\" + character.new)
    }

    return output
}