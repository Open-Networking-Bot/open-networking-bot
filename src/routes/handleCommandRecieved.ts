import { Interaction, Message } from "discord.js";
import client from "../functions/core/serverInit";
import Monad from "../functions/models/Monad";
import routeCommand from "./commandRouting";

client.on("interactionCreate", async (interaction) => {
    if(!interaction.isCommand()) return;
    await routeCommand(new Monad<Interaction, Message>(interaction, undefined))
})