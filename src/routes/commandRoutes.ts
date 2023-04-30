import { Message } from "discord.js";
import changeComment from "../controllers/comments/changeComment";
import addToCalendar from "../controllers/calendar/addToCalendar";
import calendarDelete from "../controllers/calendar/calendarDelete";
import expressTimetable from "../controllers/calendar/calendarTimetable";
import lockRequests from "../controllers/calendar/lockRequests";
import newCalendar from "../controllers/calendar/newCalendar";
import priorities from "../controllers/calendar/priorities";
import help from "../controllers/help/help";
import { memberInit, memberLink, newMemberManual } from "../controllers/initiation/joined";
import { leaveManual } from "../controllers/initiation/left";
import killit from "../controllers/misc/killit";
import ping from "../controllers/misc/ping";
import restart from "../controllers/misc/restart";
import livemembers from "../controllers/public/livemembers";
import progress from "../controllers/public/progress";
import add from "../controllers/events/add";
import attendance from "../controllers/events/attendance";
import award from "../controllers/events/award";
import goto from "../controllers/events/goingToStreamers/goto";
import { eventAttendanceHistory, visitedHistory } from "../controllers/events/history";
import eventList from "../controllers/events/list";
import message from "../controllers/events/message";
import remove from "../controllers/events/remove";
import catchup from "../controllers/supported/catchup";
import calendarLock from "../controllers/supported/calendarLock";
import manualAddition from "../controllers/supported/manualAddition";
import endWeek from "../controllers/weekEnd/endWeek";
import stages from "../controllers/weekEnd/stages";
import weekCustom from "../controllers/weekEnd/weekCustom";
import weekEnd, { weekEndOnLeaveHandler } from "../controllers/weekEnd/weekEnd";
import weekReview from "../controllers/weekEnd/weekReview";
import { DAY } from "../functions/core/magicNumbers";
import findLastMonday from "../functions/features/findLastMonday";
import messages from "../functions/models/messages";
import Monad from "../functions/models/Monad";
import { curry } from "../functions/util/functionalPatterns";
import requireContentLengthOf from "../functions/validation/requireContentLengthOf";
import { callback, legacyCallback } from "./models/commandCallbackTypes";
import CommandController from "./models/CommandController";
import * as whoISupported from "../controllers/supported/whoISupported"
import * as calendarSupport from "../controllers/supported/calendarSupport"
import * as shoutOutSupport from "../controllers/supported/shoutOutSupport"
import table from "../controllers/dev/table";
import crossref from "../controllers/dev/crossref";
import forgiveOnLeaveRecord from "../controllers/onLeave/forgive";
import { removeOnLeave } from "../controllers/onLeave/removeOnLeave";

async function eventHistory(message : Message, content : string[]){
    if(await requireContentLengthOf(message,content,3)) return;
    switch(content[2]){
        case "attendance": await eventAttendanceHistory(message,content); break;
        case "visited": await visitedHistory(message, content); break;
        default: await message.reply({content: messages.event_history_invalid_type}); break;
    }
}

const UNCATEGORIZED_LEGACY_COMMANDS = [
    new CommandController("PING", new Monad<callback, legacyCallback>(undefined, ping)),
    new CommandController("KILLIT", new Monad<callback, legacyCallback>(undefined, killit)),
    new CommandController("RESTART", new Monad<callback, legacyCallback>(undefined, restart)),
    new CommandController("CATCHUP", new Monad<callback, legacyCallback>(undefined, catchup)),
    new CommandController("PURGE", new Monad<callback, legacyCallback>(undefined, catchup)),
    new CommandController("PROGRESS", new Monad<callback, legacyCallback>(undefined, progress)),
    new CommandController("LIVEMEMBERS", new Monad<callback, legacyCallback>(undefined, livemembers)),
    new CommandController("HELP", new Monad<callback, legacyCallback>(undefined, help)),
    new CommandController("LINK", new Monad<callback, legacyCallback>(undefined, memberLink)),
]

const EVENT_LEGACY_COMMANDS = [
    new CommandController("EVENT_LIST", new Monad<callback, legacyCallback>(undefined, eventList)),
    new CommandController("EVENT_ATTENDANCE", new Monad<callback, legacyCallback>(undefined, attendance)),
    new CommandController("EVENT_ADD", new Monad<callback, legacyCallback>(undefined, add)),
    new CommandController("EVENT_AWARD", new Monad<callback, legacyCallback>(undefined, award)),
    new CommandController("EVENT_REMOVE", new Monad<callback, legacyCallback>(undefined, remove)),
    new CommandController("EVENT_GOTO", new Monad<callback, legacyCallback>(undefined, goto)),
    new CommandController("EVENT_HISTORY", new Monad<callback, legacyCallback>(undefined, eventHistory)),
    new CommandController("EVENT_MESSAGE", new Monad<callback, legacyCallback>(undefined, message)),
]

const WEEK_LEGACY_COMMANDS = [
    new CommandController("WEEK_END", new Monad<callback, legacyCallback>(undefined, 
        curry(endWeek) (weekEnd) ({dateToStartFrom: findLastMonday(), weeksToConsider: 1}) (weekEndOnLeaveHandler) )),

    new CommandController("WEEK_REVIEW", new Monad<callback, legacyCallback>(undefined, 
        curry(endWeek) (weekReview) ({dateToStartFrom: new Date(), weeksToConsider: 1}) (()=>false) )),

    new CommandController("WEEK_MONTH", new Monad<callback, legacyCallback>(undefined, 
        curry(endWeek) (weekReview) ({dateToStartFrom: new Date(), weeksToConsider: 4.28571429}) (()=>false) )),

    new CommandController("WEEK_CUSTOM", new Monad<callback, legacyCallback>(undefined, weekCustom)),
    new CommandController("WEEK_STAGE", new Monad<callback, legacyCallback>(undefined, stages)),
]

const USER_LEGACY_COMMANDS = [
    new CommandController("USER_INIT", new Monad<callback, legacyCallback>(undefined, memberInit)),
    new CommandController("USER_ADD", new Monad<callback, legacyCallback>(undefined, newMemberManual)),
    new CommandController("USER_REMOVE", new Monad<callback, legacyCallback>(undefined, leaveManual)),
    new CommandController("USER_COMMENT", new Monad<callback, legacyCallback>(undefined, changeComment)),
]

const CALENDAR_LEGACY_COMMANDS = [
    new CommandController("CALENDAR_LOCK", new Monad<callback, legacyCallback>(undefined, calendarLock)),
    new CommandController("CALENDAR_LOCKREQUESTS", new Monad<callback, legacyCallback>(undefined, lockRequests)),
    new CommandController("CALENDAR_NEW", new Monad<callback, legacyCallback>(undefined, newCalendar)),
    new CommandController("CALENDAR_ADD", new Monad<callback, legacyCallback>(undefined, addToCalendar)),
    new CommandController("CALENDAR_DELETE", new Monad<callback, legacyCallback>(undefined, calendarDelete)),
    new CommandController("CALENDAR_PRIORITIES", new Monad<callback, legacyCallback>(undefined, priorities)),
    new CommandController("CALENDAR_TIMETABLE", new Monad<callback, legacyCallback>(undefined, expressTimetable)),

]

const TAG_LEGACY_COMMANDS = [
    new CommandController("TAG_SUPPORT", new Monad<callback, legacyCallback>(undefined, 
        curry(manualAddition) (whoISupported.handleAddition))),

    new CommandController("TAG_CALENDAR", new Monad<callback, legacyCallback>(undefined, 
        curry(manualAddition) (calendarSupport.handleAddition))),

    new CommandController("TAG_SHOUTOUT", new Monad<callback, legacyCallback>(undefined, 
        curry(manualAddition) (shoutOutSupport.handleAddition))),
]

const DEV_LEGACY_COMMANDS = [
    new CommandController("DEV_TABLE", new Monad<callback, legacyCallback>(undefined, table)),
    new CommandController("DEV_CROSSREF", new Monad<callback, legacyCallback>(undefined, crossref)),

]

const ONLEAVE_LEGACY_COMMANDS = [
    new CommandController("ONLEAVE_FORGIVE", new Monad<callback, legacyCallback>(undefined, forgiveOnLeaveRecord)),
    new CommandController("ONLEAVE_REVOKE", new Monad<callback, legacyCallback>(undefined, removeOnLeave)),
]

export default [
    ...UNCATEGORIZED_LEGACY_COMMANDS,
    ...EVENT_LEGACY_COMMANDS,
    ...WEEK_LEGACY_COMMANDS,
    ...USER_LEGACY_COMMANDS,
    ...CALENDAR_LEGACY_COMMANDS,
    ...TAG_LEGACY_COMMANDS,
    ...DEV_LEGACY_COMMANDS,
    ...ONLEAVE_LEGACY_COMMANDS,
]
