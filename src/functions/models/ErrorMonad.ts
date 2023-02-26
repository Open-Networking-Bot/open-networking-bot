export default class<T>{

    private monad : Error | T

    private readonly ERROR_TYPE = "[object Error]"
    
    public get Monad() : T | Error {
         if(this.IsError()) return this.monad as Error
         return this.monad as T
    }
    

    constructor(monad : Error | T){
        this.monad = monad
    }

    public IsError(){
        return Object.prototype.toString.call(this.monad) === this.ERROR_TYPE
    }
}