# Karma rules for Bazel

**WARNING: super hacky initial prototype DO NOT USE**

# Installation

Install current bazel. On mac, `brew install bazel`. On other platforms,
https://docs.bazel.build/versions/master/install.html

Run `bazel run @yarn//:yarn` to install the hermetic `node_modules`.

# Try it

One-shot as a test:

```
$ bazel test example
```

Watch mode:

First install ibazel: https://github.com/bazelbuild/bazel-watcher

```
$ ibazel run example
```
