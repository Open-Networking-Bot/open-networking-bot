/**
 * @class
 * @author Lewis Page
 * @description A form of monad, designed for the type of `Error | T`.
 */
export default class ErrorMonad<T>{

    private monad : Error | T

    private readonly ERROR_TYPE = "[object Error]"
    
    /**
     * @author Lewis Page
     * @description Gets the value of the Monad.
     * @returns The raw value of the Monad.
     */
    public get Monad() : Error | T {
         return this.monad
    }
    

    /**
     * @author Lewis Page
     * @constructor
     * @param monad The error or type, held by the Monad.
     */
    constructor(monad : Error | T){
        this.monad = monad
    }

    /**
     * @author Lewis Page
     * @description Finds if the Monad Value is an error.
     * @returns If the value inside the Monad is an error or not.
     */
    public IsError(){
        return Object.prototype.toString.call(this.monad) === this.ERROR_TYPE
    }
}