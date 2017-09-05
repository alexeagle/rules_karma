System.register("thing", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function add(i, i2) {
        return i + i2;
    }
    exports_1("add", add);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("thing.spec", ["thing"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
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
