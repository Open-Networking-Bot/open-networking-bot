import { CacheType, Channel, CommandInteractionOptionResolver, Guild, GuildMember, InteractionReplyOptions, MessagePayload, ReplyMessageOptions, User } from "discord.js";
import TextCommandOption from "./TextCommandOption";

export default interface AbstractedCommand {
    author : User,
    guild : Guild,
    channel : Channel,
    member : GuildMember,
    options : Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused"> | TextCommandOption,
    reply : (content : any) => Promise<any>,
    react : (content : any) => Promise<any>,
}