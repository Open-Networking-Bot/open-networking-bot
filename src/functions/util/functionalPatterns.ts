/**
 * Allows for several functions to be chained together, with their results passing from one to another.
 * @param functions All the functions to pipleline into one another.
 * @returns The result of the final function, executed.
 * @author Lewis Page
 */
export function pipeline<T>(...functions : any[]) : T{
    let currentResult : any = functions[0]
    
    for (let f of functions.slice(1)) {
       currentResult = f(currentResult) 
    }

    return currentResult as T
}

/**
 * Curries functions, given to it.
 * @param func The function to curry.
 * @returns The curried function.
 * @author https://javascript.info/currying-partials
 */
export function curry<T extends Function>(func : T) {
    return function curried(...args : any[]) {
      if (args.length >= func.length) {
        //@ts-ignore
        return func.apply(this, args);
      } else {
        return function(...args2 : any[]) {
          //@ts-ignore
          return curried.apply(this, args.concat(args2));
        }
      }
    };
}