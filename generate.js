"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var mkdir = require("mkdirp");
var utf8 = { encoding: 'utf8' };
function doGenerate(rootDir) {
    // Number of divisions in the company
    var divNum = 10;
    // Number of applications owned in each division
    var appNum = 10;
    // Number of modules in each application
    var modNum = 10;
    // Number of components in each module
    var cmpNum = 10;
    var currentComponent = 0;
    var deps = [];
    for (var divCnt = 0; divCnt < divNum; divCnt++) {
        var divName = "div" + divCnt;
        for (var appCnt = 0; appCnt < appNum; appCnt++) {
            var appName = "app" + appCnt;
            var appImports = '';
            for (var modCnt = 0; modCnt < modNum; modCnt++) {
                var modName = "mod" + modCnt;
                var moduleImports = '';
                var moduleNames = [];
                for (var cmpCnt = 0; cmpCnt < 10; cmpCnt++) {
                    var cmpName = "cmp" + cmpCnt;
                    var componentClassName = "Cmp" + currentComponent + "Component";
                    moduleImports += "import {" + componentClassName + "} from './" + cmpName + "/cmp';\n";
                    moduleNames.push(componentClassName);
                    var tsContent = "\n          export class " + componentClassName + " {\n            add" + currentComponent + "(x: number) {\n              return x + " + currentComponent + ";\n            }\n          }";
                    var specContent = "\n          import { " + componentClassName + " } from './cmp';\n          describe('" + componentClassName + "', () => {\n            it('should add', () => {\n              expect(new " + componentClassName + "().add" + currentComponent + "(1)).toBe(" + (1 + currentComponent) + ");\n            });\n          });";
                    // Each component goes in a directory by itself, matching ng-cli
                    var dir_1 = path.join(rootDir, divName, appName, modName, cmpName);
                    mkdir.sync(dir_1);
                    fs.writeFileSync(dir_1 + "/cmp.ts", tsContent, utf8);
                    fs.writeFileSync(dir_1 + "/cmp.spec.ts", specContent, utf8);
                    currentComponent++;
                }
                var buildContent = "package(default_visibility = [\"//visibility:public\"])\nload(\"@build_bazel_rules_typescript//:defs.bzl\", \"ts_library\")\n\nts_library(\n  name = \"" + modName + "\",\n  srcs = glob([\"**/*.ts\"], exclude=[\"**/*.spec.ts\"]),\n  tsconfig = \"//" + rootDir + ":tsconfig.json\",\n)\n\nts_library(\n  name = \"" + modName + "_tests\",\n  testonly = 1,\n  deps = [\":" + modName + "\"],\n  srcs = glob([\"**/*.spec.ts\"]),\n  tsconfig = \"//" + rootDir + ":tsconfig.json\",\n)\n";
                var dir = path.join(rootDir, divName, appName, modName);
                deps.push("//" + dir + ":" + modName, "//" + dir + ":" + modName + "_tests");
                fs.writeFileSync(dir + "/BUILD.bazel", buildContent, utf8);
            }
        }
    }
    fs.writeFileSync(path.join(rootDir, "tsconfig.json"), "{\n    \"compilerOptions\": {\n      \"types\": [\"jasmine\"]\n    }\n  }", utf8);
    fs.writeFileSync(path.join(rootDir, "BUILD.bazel"), "\nexports_files([\"tsconfig.json\"])\n\nload(\"@karma//:index.bzl\", \"karma_test\")\n\nkarma_test(\n    name = \"tests\",\n    deps = [" + deps.map(function (d) { return "\"" + d + "\""; }).join(",\n") + ",\n      # FIXME(alexeagle): doesn't belong here\n      \"//internal/karma_concat_js\",\n    ],\n    tags = [\"local\"]\n)\n", utf8);
}
function main(argv) {
    doGenerate('org');
    return 0;
}
if (require.main === module) {
    process.exitCode = main(process.argv.slice(2));
}
