import {Client, Intents} from "discord.js"
import dotenv from "dotenv"

dotenv.config()

const intents =
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_VOICE_STATES
        ]
    }
const client = new Client(intents);

export default client