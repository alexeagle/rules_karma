const fs = require('fs');

const mode = process.argv[2];
const testCount = 10;
const addPerTest = 100;

if (mode === 'adders') {
  for (i = 0; i < addPerTest * testCount; i++) {
    const content = `define(["require", "exports"], function (require, exports) {
        "use strict";
        exports.__esModule = true;
        function add${i}(i) {
            return i + ${i};
        }
        exports.add${i} = add${i};
      });`;
    path = `example/${mode}/add${i}.js`;
    fs.writeFileSync(path, content, {encoding: 'utf-8'});
  }
} else if (mode === 'specs') {
  for (i = 0; i < testCount; i++) {
    let imports = [];
    let symbols = [];
    let asserts = [];
    for (j = 0; j < addPerTest; j++) {
      const idx = i * addPerTest + j;
      imports.push(`"../adders/add${idx}"`);
      symbols.push(`add_${idx}`);
      asserts.push(`expect(add_${idx}.add${idx}(1)).toBe(${1 + idx});`);
    }
    const content = `define(["require", "exports", ${imports.join(", ")}], function (require, exports, ${symbols.join(", ")}) {
      "use strict";
      exports.__esModule = true;
      describe("thing", function () {
          it("adds", function () {
            ${asserts.join("\n")}
          });
      });
    });
    `
    path = `example/${mode}/add${i}.spec.js`;
    fs.writeFileSync(path, content, {encoding: 'utf-8'});
  }
} else {
  console.error("unknown mode", mode);
}
