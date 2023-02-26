/**
 * @class
 * @author Lewis Page
 * @description Is a generic monad. Can be used to differentiate between types.
 */
export default class Monad<T, J>{
    private _tval : T | undefined
    private _jVal : J | undefined

    public get Value(){
        if(!!this._tval) return this._tval
        return this._jVal
    }

    /**
     *  @constructor
     *  @author Lewis Page
     *  @argument tVal the value of the Monad's T value.
     *  @argument jVal the value of the Monad's J value.
     */
    constructor(tVal : T | undefined = undefined, jVal : J | undefined) {
        this._tval = tVal
        this._jVal = jVal
    }

    /**
     * @author Lewis Page
     * @description runs one of two callback functions, depending on the data in the Monad.
     * @param isT the callback for if the Monad is holding a value of type T
     * @param isJ the callback for if the Mondad is holding a value of type J
     */
    handle(isT : (tValue : T) => any, isJ : (jValue : J) => any){
        if(!!this._tval) return isT(this._tval!)
        return isJ(this._jVal!)
    }

    /**
     * @author Lewis Page
     * @description runs one of two asynchronous callback functions, depending on the data in the Monad.
     * @param isT the callback for if the Monad is holding a value of type T
     * @param isJ the callback for if the Mondad is holding a value of type J
     */
    async handleAsync(isT : (tValue : T) => Promise<any>, isJ : (jValue : J) => Promise<any>){
        if(!!this._tval) return await isT(this._tval!)
        return await isJ(this._jVal!)
    }
}