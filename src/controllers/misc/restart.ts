import {Message} from "discord.js";
import authenticate from "../../functions/util/authenticate";
import { AccessLevels } from "../../functions/models/accessLevels";
import { exec } from "child_process";
import path from "path";

export default async function (message : Message){
    if(authenticate(message, AccessLevels.Council)) return;
    await message.react("✅")
    exec(`${path.join(__dirname, "..", "..", "config", "restart_process.sh")}&`, () => {})
    process.exit(0)
}