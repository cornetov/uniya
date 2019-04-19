import { Core, Base64 } from "../src/index";

describe("Base Core tests >>>", () => {

    describe('Core tests', () => {

        var to = { test: "Simple", value: 78.9 };
        it('should be true', () => {
            expect(Core.isEmpty(to)).toBe(false);
        });
        it('should be false', () => {
            expect(Core.isEmpty({})).toBe(true);
        });
        it('should be 3 test value', () => {
            expect(Core.repeater(to.test, 3)).toBe("SimpleSimpleSimple");
        });
        it('should be value number', () => {
            let clone = Core.clone(to);
            expect(clone["value"]).toBe(78.9);
        });
        it('should be "Hello World" encode in Base64 as "SGVsbG8gV29ybGQ="', () => {
            let code = Base64.encode("Hello World");
            expect(code).toBe("SGVsbG8gV29ybGQ=");
        });
        it('should be "SGVsbG8gV29ybGQ=" encode in Base64 as "Hello World"', () => {
            let code = Base64.decode("SGVsbG8gV29ybGQ=");
            expect(code).toBe("Hello World");
        });
    });
});