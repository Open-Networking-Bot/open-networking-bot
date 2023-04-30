import database from "../../functions/core/database"
import { SupportTypes } from "../../functions/models/supportTypes"
import addSupport from "./addSupport"
import { recordHandle } from "./supportUpdating"

/**
 * @author Lewis Page
 * @description Adds Shoutout Points for a member
 * @param member The database member, with points being added to
 * @param num The number of points to be added
 */
export const handleAddition : recordHandle = async (member, num) => {
    await addSupport(SupportTypes.shoutout, num, member.id)
}

/**
 * @author Lewis Page
 * @description Subtracts Shoutout Points from a member
 * @param member The database member, with points being subtracted from
 * @param num The number of points to be added
 */
export const handleSubtraction : recordHandle = async (member, num) => {
    await addSupport(SupportTypes.shoutout, num * -1, member.id)
}