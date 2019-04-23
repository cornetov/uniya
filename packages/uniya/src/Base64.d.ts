/**
 * Base64 static encoding class.
 * @class Base64
 */
export declare class Base64 {
    /**
     * Convert ucs-2 string to base64 encoded ascii
     * @param str {string} The common ucs-2 string.
     */
    static encode(str: string): string;
    /**
     * Convert base64 encoded ascii to ucs-2 string
     * @param str {string} The base64 encoded ascii.
     */
    static decode(str: string): string;
}
