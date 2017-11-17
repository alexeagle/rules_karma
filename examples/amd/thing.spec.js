define('karma/examples/amd/thing.spec', ['require', 'exports', 'karma/examples/amd/thing'],
 function (require, exports, thing_1) {
  "use strict";
  exports.__esModule = true;
  describe("thing", function () {
      it("adds", function () {
          expect(thing_1.add(1, 2)).toBe(3);
      });
  });
});
