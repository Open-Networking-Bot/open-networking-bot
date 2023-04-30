/**
 * @author Lewis Page
 * @description Finds the last monday, that has just passed.
 * @param diff The amount of time to subtract from the start of last monday.
 * @returns The time since the last monday, with the `diff` subtracted.
 */
export default function findLastMonday(diff : number = 0){
    const today = new Date()
    const weekStart = new Date(today.setDate((today.getDate() - (today.getDay() === 0 ? 6 : (today.getDay() - 1)))))
    
    weekStart.setHours(0)
    weekStart.setMinutes(0)
    weekStart.setSeconds(0)
    weekStart.setMilliseconds(0)

    return new Date(weekStart.getTime() - diff)
}