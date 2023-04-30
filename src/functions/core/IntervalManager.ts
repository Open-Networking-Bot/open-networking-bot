/**
 * @interface
 * @author Lewis Page
 * @description Holds a name identifier for an interval, and the object that lets it be cleared.
 */
export interface IntervalInstance {
    interval : NodeJS.Timeout,
    name : string
}

/**
 * @class
 * @author Lewis Page
 * @description Holds several JavaScript intervals, allowing them all to be run asyncronously.
 */
export default class IntervalManager{
        
        private _instances : IntervalInstance[] = []

        /**
         * @author Lewis Page
         * @description Adds new instances to the IntervalManager.
         * @param instances All the instances to add to the IntervalManager.
         */
        addInstance(...instances : IntervalInstance[]){
            this._instances.push(...instances)
        }

        /**
         * @author Lewis Page
         * @description Removes instances from the IntervalManager, stopping their invocation.
         * @param ids The name identifiers of the intervals to clear/remove from the IntervalManager.
         */
        removeInstance(...ids : string[]){
            this._instances = this._instances.filter(i => {
                const shouldKeep = !ids.find(x => i.name === x)
                if(!shouldKeep) clearInterval(i.interval)
                return shouldKeep
            })
        }

        /**
         * @author Lewis Page
         * @description Clears all instances from the IntervalManager, stopping all their invocations.
         */
        clear(){
            this._instances.forEach(i => clearInterval(i.interval))
            this._instances = []
        }

        /**
         * @constructor
         * @author Lewis Page
         * @param instances The instances to originally add to the IntervalManager.
         */
        constructor(instances : IntervalInstance[]) {
            this._instances.push(...instances)
        }
}