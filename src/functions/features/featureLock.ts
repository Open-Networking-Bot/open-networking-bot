export default class FeatureLock{
    private getLock;
    private setLock;

    
    public async isActive(){
        return await this.getLock()
    }

    public async toggle(){
        const curr = await this.isActive()
        await this.setLock(!curr)
        return !curr
    }
    

    constructor(getLock : (() => Promise<boolean>), setLock : ((to : boolean) => Promise<void>)){
        this.getLock = getLock
        this.setLock = setLock
    }
}