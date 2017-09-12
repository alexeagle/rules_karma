import {Foo} from './foo';

describe("Foo", () => {
    it("should double", () => {
        expect(new Foo().double(2)).toBe(4);
    });
});