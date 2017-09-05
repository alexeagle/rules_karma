import {add} from './thing';

describe("thing", () => {
  it("should add", () => {
    expect(add(1, 2)).toBe(3);
  });
});
