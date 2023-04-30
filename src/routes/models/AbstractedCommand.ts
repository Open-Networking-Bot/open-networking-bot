import { CacheType, Channel, CommandInteractionOptionResolver, Guild, GuildMember, InteractionReplyOptions, MessagePayload, ReplyMessageOptions, User } from "discord.js";
import TextCommandOption from "./TextCommandOption";

/**
 * @interface
 * @author Lewis Page
 * @description Holds all the information needed for a command to be interpreted by the controllers.
 */
export default interface AbstractedCommand {
    author : User,
    guild : Guild,
    channel : Channel,
    member : GuildMember,
    options : Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused"> | TextCommandOption,
    reply : (content : any) => Promise<any>,
    react : (content : any) => Promise<any>,
}