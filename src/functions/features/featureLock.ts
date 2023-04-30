/**
 * @class
 * @author Lewis Page
 * @description Creates a lock, which can be used to toggle features.
 */
export default class FeatureLock{
    private getLock;
    private setLock;

    /**
     * @author Lewis Page
     * @description Checks if the lock is active or not.
     * @returns If the lock is active or not.
     */
    public async isActive(){
        return await this.getLock()
    }

    /**
     * @author Lewis Page
     * @description Toggles the lock's state.
     * @returns The updated lock state.
     */
    public async toggle(){
        const curr = await this.isActive()
        await this.setLock(!curr)
        return !curr
    }
    
    /**
     * @constructor
     * @author Lewis Page
     * @param getLock An asyncronous function, which retrieves the current lock state.
     * @param setLock An asyncronous function, which allows for the state of the lock to be defined.
     */
    constructor(getLock : (() => Promise<boolean>), setLock : ((to : boolean) => Promise<void>)){
        this.getLock = getLock
        this.setLock = setLock
    }
}