import { L } from './Localizer';

/**
 * 
 * @class XML exceptions.
 */
export class Locale {

    // ** fields
    private static _locale: string;

    // ** ctor

    ///**
    // * Create locale with name, for example "en-US".
    // * @param locale {string} The locale name.
    // */
    //constructor(locale: string) {
    //    this._locale = locale;
    //}

    // ** properties

    public static get locale(): string {
        return Locale._locale;
    }
    public static set locale(locale: string) {
        Locale._locale = locale;
    }


    // ** methods

    /**
     * Gets locale term value.
     * @param term {string} The term unique name.
     * @param value {string} The default value for the term.
     */
    public static term(term: string, value: string): string {

        // calculate term key
        //value.split("^(?i:[aeiouy]).*")
        //term: string,
        //localStorage.getItem()
        

        return value.replace("#{", "${");
    }
}

/**
 * Base exception class.
 * @class Exception
 */
export class Exception implements Error {

    // ** fields
    private _data: string;
    private _msg: string;

    // ** ctor

    /**
     * Create base exception.
     * @param message {string} The message of this exception.
     * @param data {string} The other data of this exception.
     */
    public constructor(message?: string, data?: string) {
        this._msg = message !== undefined ? message : "";
        this._data = data !== undefined ? data : "";
    }

    // ** properties

    /** Gets message of this exception. */
    public get message(): string {
        return this._msg;
    }

    /** Gets or sets other data of this exception. */
    public get data(): string {
        return this._data;
    }
    public set data(data: string) {
        this._data = data;
    }

    /** Gets name of this exception. */
    public get name(): string {
        return (<any>this).constructor.name;
    }
}

(<any>Object).setPrototypeOf(Exception.prototype, Error.prototype);

/**
 * The incorrect argument exception.
 * @class IncorrectArgument.
 */
export class IncorrectArgument extends Exception {

    /**
     * Create incorrect argument exception.
     * @param name {string} The name of the argument.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string) {
        super(L.IncorrectArgument, data);
    }
}

/**
 * The incorrect format exception.
 * @class IncorrectFormat.
 */
export class IncorrectFormat extends Exception {

    /**
     * Create incorrect format exception.
     * @param name {string} The name of the format.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string) {
        super(L.IncorrectFormat, data);
    }
}

/**
 * The unexpected name exception.
 * @class UnexpectedName.
 */
export class UnexpectedName extends Exception {

    /**
     * Create unexpected name exception.
     * @param name {string} The name that unexpected.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string) {
        super(L.UnexpectedName, data);
    }
}

/**
 * The unknown name exception.
 * @class UnknownName.
 */
export class UnknownName extends Exception {

    /**
     * Create unknown name exception.
     * @param name {string} The name that unknown.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string) {
        super(L.UnknownName, data);
    }
}

/**
 * The storage error (authentication or work).
 * @class UnknownName.
 */
export class AuthenticationFail extends Exception {

    /**
     * Create unknown name exception.
     * @param url {string} The URL string of the storage.
     * @param data {string} The other data of this exception.
     */
    constructor(url: string, data?: string) {
        super(L.AuthenticationFail, data);
    }
}

/**
 * The storage fail exception (CRUD operations).
 * @class UnknownName.
 */
export class StorageFail extends Exception {

    /**
     * Create storage fail exception (CRUD operations).
     * @param url {string} The URL string of the storage.
     * @param data {string} The other data of this exception.
     */
    constructor(url: string, data?: string) {
        super(L.StorageFail, data);
    }
}

// ------------------------------------------------------------------------------------------------

/**
 * The static core utilites for JavaScript/TypeScript.
 */
export class Core {

    /**
     * Is Node.js enviromant ot no
     */
    public static get isNode(): boolean {
        if (typeof process === 'object') {
            if (typeof process.versions === 'object') {
                if (typeof process.versions.node !== 'undefined') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Is empty object?
     * @param a The object for test.
     */
    public static isEmpty(a: any) {
        try {
            return Object.keys(a).length === 0;
        }
        catch (ex) {

            // unexpexted exception!
            console.log(ex);

            // bad done
            return false;
        }
    }
    /**
     * Create clone object.
     * @param a The object to clone.
     */
    public static clone(a: any) {
        try {
            return JSON.parse(JSON.stringify(a));
        }
        catch (ex) {

            // unexpexted exception!
            console.log(ex);

            // basis values
            if (!(a instanceof Object)) {
                return a;
            }

            // special objects
            var objectClone;
            var Constructor = a.constructor;
            switch (Constructor) {
                case RegExp:
                    objectClone = new Constructor(a);
                    break;
                case Date:
                    objectClone = new Constructor(a.getTime());
                    break;
                default:
                    objectClone = new Constructor();
            }

            // each property
            for (let p in a) {
                objectClone[p] = Core.clone(a[p]);
            }

            // done
            return objectClone;
        }
    }
    ///**
    // * Create typed clone object.
    // * @param a The object to clone.
    // */
    //public static typedClone<T>(a: any): T {

    //    // special objects
    //    let clone: T;
    //    let Constructor = a.constructor;
    //    switch (Constructor) {
    //        case RegExp:
    //            clone = new Constructor(a);
    //            break;
    //        case Date:
    //            clone = new Constructor(a.getTime());
    //            break;
    //        default:
    //            clone = new Constructor();
    //    }

    //    // each property
    //    for (let p in a) {
    //        clone[p] = Core.clone(a[p]);
    //    }

    //    // done
    //    return clone;
    //}
    /**
     * Repeat string or char for text.
     * @param s The char or sring for a repeat.
     * @param count How many times is need to repeat.
     * @param text The text for added, by default is empty.
     * @return {string} The text with repeated blocks.
     */
    public static repeater(s: string, count: number, text: string = ""): string {
        for (let i = 0; i < Math.max(0, count); i++) {
            text += s;
        }
        return text;
    }
}