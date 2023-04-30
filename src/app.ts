import client from "./functions/core/serverInit";
import fs from "fs";
import { join } from "path";
import catchup, { TERMINATION_DETAILS_PATH } from "./controllers/supported/catchup";
import database from "./functions/core/database"
import newServer from "./controllers/initiation/newServer";
import newBeenRaidedRecords from "./controllers/initiation/newBeenRaidedRecords";
import { saveMessageHistory } from "./controllers/misc/messageHandler";
import { logMessage, logType } from "./controllers/logging/loggingManager";
import IntervalManager from "./functions/core/IntervalManager";
import liveRoleUpdater from "./controllers/interval/liveRoleUpdater";
import removeNewRole from "./controllers/interval/removeNewRole";
import autoWeekEnd from "./controllers/interval/autoWeekEnd";
import createSlashCommands from "./routes/createSlashCommands";
import config from "./functions/models/config";

const intervalManager = new IntervalManager([]);

client.on('ready', async () => {
    if(process.argv.length > 2 && process.argv[2] === "first_time_setup") await newServer();
    if(process.argv.length > 2 && process.argv[2] === "been_raided_records") await newBeenRaidedRecords();
    if(process.argv.length > 2 && process.argv[2] === "slashcommand_setup") await createSlashCommands();

    console.log(`The bot is readied`)
    if(!(await database.calendarConfig.findFirst({where: {serverId: config.server_id}})))
        await database.calendarConfig.create({data: {latestDate: new Date(0), serverId: config.server_id}})
    catchup()

    intervalManager.addInstance(liveRoleUpdater, removeNewRole, autoWeekEnd)
});

client.on("error", error => {
    logMessage(error.message, logType.critical)
})

import "./routes/eventDrivenRoutes"
import "./routes/handleCommandRecieved"
import "./routes/handleMessageRecieved"

client.login(process.env.SECRET).then(async () => await createSlashCommands()).catch(err => console.error(err));

['exit', 'SIGTERM'].forEach(processName => process.on(processName, () => {
    saveMessageHistory()
    fs.writeFileSync(join(__dirname, TERMINATION_DETAILS_PATH), new Date().toISOString())
}))