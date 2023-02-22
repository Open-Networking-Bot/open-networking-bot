import { Channel, CommandInteraction, GuildMember, Interaction, Message } from "discord.js";
import helpCommandsObject, { Command } from "../functions/features/helpCommands";
import messages from "../functions/models/messages";
import Monad from "../functions/models/Monad";
import authenticate from "../functions/util/authenticate";
import { pipeline } from "../functions/util/functionalPatterns";
import commandRoutes from "./commandRoutes";
import convertIDtoCommand from "./convertIDtoCommand";
import analyseCommand, { CommandOptionErrorResponse } from "./createCommandOptions";
import handleLegacyRoute from "./handleLegacyRoute";
import AbstractedCommand from "./models/AbstractedCommand";

type brokenAbstractedCommand = {
    reply : (message : any) => any,
    command : string,
    error : CommandOptionErrorResponse
}

/**
 * @author Lewis page
 * @description Handles routing interactions and messages to the appropriate bot controller.
 * @param route A monad, containing either the interaction to trigger routing, or the message that was sent.
 * @returns A promise, containing what the bot has done in response.
 */
export default async function routeCommand(route : Monad<Interaction, Message>){

    let abstractedCommand : AbstractedCommand | brokenAbstractedCommand | null = null
    let commandYaml : Command | null = null

    // Create an abstracted command, using a different method depending on if an interaction was given or a message
    await route.handleAsync(
            // Handle interactions
            async interaction => {
                const potentialCommand = convertIDtoCommand((interaction as CommandInteraction).commandName.toUpperCase())
                if(potentialCommand === CommandOptionErrorResponse.NoCommandExists){
                    abstractedCommand = {
                        error: potentialCommand,
                        command: (interaction as CommandInteraction).commandName.replace("_", " "),
                        reply: a => (interaction as CommandInteraction).reply(a)
                    }
                    return;
                }
                commandYaml = potentialCommand as Command

                abstractedCommand = {
                    author: interaction.user,
                    channel: interaction.channel! as Channel,
                    guild: interaction.guild!,
                    options: (interaction as CommandInteraction).options,
                    member: interaction.member as GuildMember,
                    reply: a => (interaction as CommandInteraction).reply(a),
                    react: a => (interaction as CommandInteraction).reply({ephemeral: true, content: a})
                }
            }, 

            // Handle Messages
            async message => {

                const options = analyseCommand(message)
                if(options === CommandOptionErrorResponse.InvalidMember ||
                     options === CommandOptionErrorResponse.NoCommandExists ||
                      options === CommandOptionErrorResponse.NotEnoughArgs){
                        abstractedCommand = {reply: a => message.reply(a), command: message.content.slice(1).split(" ")[0].toLowerCase(), error: options}
                        return;
                    }

                commandYaml = options.command
                abstractedCommand = {
                    author: message.author,
                    channel: message.channel as Channel,
                    guild: message.guild!,
                    options: options.args,
                    member: message.member!,
                    reply: a => message.reply(a),
                    react: a => message.react(a)
                }
            })
    
    // If an error was found with the command formatting, show an error to the end user
    if(!isNaN((abstractedCommand! as brokenAbstractedCommand).error)){
        const brokenCommand = (abstractedCommand! as brokenAbstractedCommand)
        switch(brokenCommand.error){
            case CommandOptionErrorResponse.NoCommandExists:
                const similarCommand = helpCommandsObject.getSimilarCommands(brokenCommand.command, 1)[0]
                const category = helpCommandsObject.getCommandCategoryFromId(similarCommand.id)
                return brokenCommand.reply(`⚠️ The command inputted does not exist. Did you mean: \`$${!!category ? `${category.name} ` : ""}${similarCommand.name}\`?`)

            case CommandOptionErrorResponse.InvalidMember:
                return brokenCommand.reply(messages.no_user)

            case CommandOptionErrorResponse.NotEnoughArgs:
                return brokenCommand.reply(messages.invalid_content_length)
        }
    }

    // If no errors were found, identify the correct command controller, authenticate the user, and continue to running the command.
    for(let command of commandRoutes){
        const category = helpCommandsObject.getCommandCategoryFromId(commandYaml!.id)
        const commandYamlId = !!category ? category.id + "_" + commandYaml!.id : commandYaml!.id

        if(command.id !== commandYamlId) continue;
        if(!!commandYaml!.access_level && await authenticate(route.Value! as CommandInteraction | Message, commandYaml!.access_level)) return;

        return command.onCommandInvoke.handleAsync(
            // For modern commands
            async (controller) => {
                await controller(abstractedCommand! as AbstractedCommand)
            }, 

            // For legacy commands
            async (controller) => {
                await handleLegacyRoute(controller, abstractedCommand! as AbstractedCommand, route, commandYaml!, category)
            }
        )
    }

    abstractedCommand!.reply("<@422642443331043338> made a mistake when writing the command router: blame him, not me!")
}