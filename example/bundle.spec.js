define("foo", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Foo = (function () {
        function Foo() {
        }
        Foo.prototype.double = function (n) {
            return n * 2;
        };
        return Foo;
    }());
    exports.Foo = Foo;
});
define("foo.spec", ["require", "exports", "foo"], function (require, exports, foo_1) {
    "use strict";
    exports.__esModule = true;
    describe("Foo", function () {
        it("should double", function () {
            expect(new foo_1.Foo().double(2)).toBe(4);
        });
    });
});
/**
 * We have to add this manual require statement, in an anonymous module, or it isn't executed
 */
define(["require", "foo.spec"], function(require) {
    require("foo.spec");
});
