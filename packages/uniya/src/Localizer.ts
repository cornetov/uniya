import { Locale } from './Core';

export class L {

    public static get IncorrectArgument(): string {
        return Locale.term("IncorrectArgument", "Incorrect argument: #{name}.")
    }
    public static get IncorrectFormat(): string {
        return Locale.term("IncorrectFormat", "Incorrect #{name} format.")
    }
    public static get UnexpectedName(): string {
        return Locale.term("UnexpectedName", "Unexpected #{name}.")
    }
    public static get UnknownName(): string {
        return Locale.term("UnknownName", "Unknown #{name}.")
    }
    public static get AuthenticationFail(): string {
        return Locale.term("AuthenticationFail", "Fail at authentication (posible incorrect login or password) by address: #{url}.")
    }
    public static get StorageFail(): string {
        return Locale.term("StorageFail", "Fail at work with the storage by address: #{url}.")
    }
}