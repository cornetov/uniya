/**
 *
 * @class XML exceptions.
 */
export declare class Locale {
    private static _locale;
    static locale: string;
    /**
     * Gets locale term value.
     * @param term {string} The term unique name.
     * @param value {string} The default value for the term.
     */
    static term(term: string, value: string): string;
}
/**
 * Base exception class.
 * @class Exception
 */
export declare class Exception implements Error {
    private _data;
    private _msg;
    /**
     * Create base exception.
     * @param message {string} The message of this exception.
     * @param data {string} The other data of this exception.
     */
    constructor(message?: string, data?: string);
    /** Gets message of this exception. */
    readonly message: string;
    /** Gets or sets other data of this exception. */
    data: string;
    /** Gets name of this exception. */
    readonly name: string;
}
/**
 * The incorrect argument exception.
 * @class IncorrectArgument.
 */
export declare class IncorrectArgument extends Exception {
    /**
     * Create incorrect argument exception.
     * @param name {string} The name of the argument.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string);
}
/**
 * The incorrect format exception.
 * @class IncorrectFormat.
 */
export declare class IncorrectFormat extends Exception {
    /**
     * Create incorrect format exception.
     * @param name {string} The name of the format.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string);
}
/**
 * The unexpected name exception.
 * @class UnexpectedName.
 */
export declare class UnexpectedName extends Exception {
    /**
     * Create unexpected name exception.
     * @param name {string} The name that unexpected.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string);
}
/**
 * The unknown name exception.
 * @class UnknownName.
 */
export declare class UnknownName extends Exception {
    /**
     * Create unknown name exception.
     * @param name {string} The name that unknown.
     * @param data {string} The other data of this exception.
     */
    constructor(name: string, data?: string);
}
/**
 * The storage error (authentication or work).
 * @class UnknownName.
 */
export declare class AuthenticationFail extends Exception {
    /**
     * Create unknown name exception.
     * @param url {string} The URL string of the storage.
     * @param data {string} The other data of this exception.
     */
    constructor(url: string, data?: string);
}
/**
 * The storage fail exception (CRUD operations).
 * @class UnknownName.
 */
export declare class StorageFail extends Exception {
    /**
     * Create storage fail exception (CRUD operations).
     * @param url {string} The URL string of the storage.
     * @param data {string} The other data of this exception.
     */
    constructor(url: string, data?: string);
}
/**
 * The static core utilites for JavaScript/TypeScript.
 */
export declare class Core {
    /**
     * Is Node.js enviromant ot no
     */
    static readonly isNode: boolean;
    /**
     * Is empty object?
     * @param a The object for test.
     */
    static isEmpty(a: any): boolean;
    /**
     * Create clone object.
     * @param a The object to clone.
     */
    static clone(a: any): any;
    /**
     * Repeat string or char for text.
     * @param s The char or sring for a repeat.
     * @param count How many times is need to repeat.
     * @param text The text for added, by default is empty.
     * @return {string} The text with repeated blocks.
     */
    static repeater(s: string, count: number, text?: string): string;
}
