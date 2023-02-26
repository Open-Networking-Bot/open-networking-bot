import fs from "fs"
import path from "path";
import rootDir from "../util/rootDir";
import yaml from "yaml"

const text = fs.readFileSync(path.join(rootDir,"config","messages.yaml"), "utf-8")
const yamlParsed = yaml.parse(text) as any

export default yamlParsed