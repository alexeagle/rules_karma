System.register(["./thing"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var thing_1;
    return {
        setters: [
            function (thing_1_1) {
                thing_1 = thing_1_1;
            }
        ],
        execute: function () {
            describe("thing", function () {
                it("should add", function () {
                    expect(thing_1.add(1, 2)).toBe(3);
                });
            });
        }
    };
});
