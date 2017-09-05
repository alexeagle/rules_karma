const fs = require('fs');

const mode = process.argv[2];
const testCount = 10;
const addPerTest = 100;

if (mode === 'adders') {
  for (i = 0; i < addPerTest * testCount; i++) {
    const content = `
    System.register([], function (exports_1, context_1) {
      "use strict";
      var __moduleName = context_1 && context_1.id;
      function add${i}(i) {
          return i + ${i};
      }
      exports_1("add${i}", add${i});
      return {
          setters: [],
          execute: function () {
          }
      };
    });
    `;
    path = `example/${mode}/add${i}.js`;
    fs.writeFileSync(path, content, {encoding: 'utf-8'});
  }
} else if (mode === 'specs') {
  for (i = 0; i < testCount; i++) {
    let imports = [];
    let setters = [];
    let asserts = [];
    for (j = 0; j < addPerTest; j++) {
      const idx = i * addPerTest + j;
      imports.push(`"../adders/add${idx}"`);
      setters.push(`function (x) {
        thing_${idx} = x;
    }
    `);
      asserts.push(`expect(add_${idx}.add${idx}(1)).toBe(${1 + idx});`);
    }
    const content = `
    System.register([${imports.join(", ")}], function (exports_1, context_1) {
      "use strict";
      var __moduleName = context_1 && context_1.id;
      var thing_1, thing2_1;
      return {
          setters: [
              ${setters.join(",\n")}
          ],
          execute: function () {
              describe("thing", function () {
                  it("should add", function () {
                      ${asserts.join("\n")}
                  });
              });
          }
      };
  });`;
    path = `example/${mode}/add${i}.spec.js`;
    fs.writeFileSync(path, content, {encoding: 'utf-8'});
  }
} else {
  console.error("unknown mode", mode);
}
