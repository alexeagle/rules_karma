import * as fs from 'fs';
import * as path from 'path';
import * as mkdir from 'mkdirp';

const utf8 = {encoding: 'utf8'};

function doGenerate(rootDir: string) {
  // Number of divisions in the company
  const divNum = 10;
  // Number of applications owned in each division
  const appNum = 10;
  // Number of modules in each application
  const modNum = 10;
  // Number of components in each module
  const cmpNum = 10;
  let currentComponent = 0;
  const deps = [];
  for (let divCnt = 0; divCnt < divNum; divCnt++) {
    const divName = `div${divCnt}`;
    for (let appCnt = 0; appCnt < appNum; appCnt++) {
      const appName = `app${appCnt}`;
      let appImports = '';
      for (let modCnt = 0; modCnt < modNum; modCnt++) {
        const modName = `mod${modCnt}`;
        let moduleImports = '';
        const moduleNames = [];

        for (let cmpCnt = 0; cmpCnt < 10; cmpCnt++) {
          const cmpName = `cmp${cmpCnt}`;
          const componentClassName = `Cmp${currentComponent}Component`;
          moduleImports += `import {${componentClassName}} from './${cmpName}/cmp';\n`;
          moduleNames.push(componentClassName);
          const tsContent = `
          export class ${componentClassName} {
            add${currentComponent}(x: number) {
              return x + ${currentComponent};
            }
          }`;

          const specContent = `
          import { ${componentClassName} } from './cmp';
          describe('${componentClassName}', () => {
            it('should add', () => {
              expect(new ${componentClassName}().add${currentComponent}(1)).toBe(${1 + currentComponent});
            });
          });`;
          // Each component goes in a directory by itself, matching ng-cli
          const dir = path.join(rootDir, divName, appName, modName, cmpName);
          mkdir.sync(dir);
          fs.writeFileSync(`${dir}/cmp.ts`, tsContent, utf8);
          fs.writeFileSync(`${dir}/cmp.spec.ts`, specContent, utf8);
          currentComponent++;
        }

        const buildContent = `package(default_visibility = ["//visibility:public"])
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
  name = "${modName}",
  srcs = glob(["**/*.ts"], exclude=["**/*.spec.ts"]),
  tsconfig = "//${rootDir}:tsconfig.json",
)

ts_library(
  name = "${modName}_tests",
  testonly = 1,
  deps = [":${modName}"],
  srcs = glob(["**/*.spec.ts"]),
  tsconfig = "//${rootDir}:tsconfig.json",
)
`;
        const dir = path.join(rootDir, divName, appName, modName);
        deps.push(`//${dir}:${modName}`, `//${dir}:${modName}_tests`);
        fs.writeFileSync(`${dir}/BUILD.bazel`, buildContent, utf8);

      }

    }
  }
  fs.writeFileSync(path.join(rootDir, "tsconfig.json"), `{
    "compilerOptions": {
      "types": ["jasmine"]
    }
  }`, utf8);
  fs.writeFileSync(path.join(rootDir, "BUILD.bazel"), `
exports_files(["tsconfig.json"])

load("@karma//:index.bzl", "karma_test")

karma_test(
    name = "tests",
    deps = [${deps.map(d => `"${d}"`).join(",\n")},
      # FIXME(alexeagle): doesn't belong here
      "//internal/karma_concat_js",
    ],
    tags = ["local"]
)
`, utf8);
}

function main(argv: string[]): number {
  doGenerate('org');
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
