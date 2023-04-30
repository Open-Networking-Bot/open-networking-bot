import AbstractedCommand from "./AbstractedCommand";

/**
 * @interface
 * @extends AbstractedCommand
 * @author Lewis Page
 * @description Legacy commands require a content value as well as all other command information. This interface inherits `AbstractedCommand` to add this value.
 */
export default interface LegacyCommandAbstraction extends AbstractedCommand {
    content : string
}