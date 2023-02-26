export interface IntervalInstance {
    interval : NodeJS.Timeout,
    name : string
}

export default class{
        
        private _instances : IntervalInstance[] = []

        addInstance(...instances : IntervalInstance[]){
            this._instances.push(...instances)
        }

        removeInstance(...ids : string[]){
            this._instances = this._instances.filter(i => {
                const shouldKeep = !ids.find(x => i.name === x)
                if(!shouldKeep) clearInterval(i.interval)
                return shouldKeep
            })
        }

        clear(){
            this._instances.forEach(i => clearInterval(i.interval))
            this._instances = []
        }

        constructor(instances : IntervalInstance[]) {
            this._instances.push(...instances)
        }
}