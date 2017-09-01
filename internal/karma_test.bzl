_CONF_TMPL = "//internal:karma.conf.js"
_RUNNER_TMPL = "//internal:run_karma.sh"
_LOADER = "//internal:test-main.js"

def _karma_test_impl(ctx):
  conf = ctx.actions.declare_file(
      "{}.conf.js".format(ctx.label.name),
      sibling=ctx.outputs.executable)
  # Note: each file must have included: false to prevent it being loaded with a script tag, since we use Require.js
  files = "\n".join(["{{pattern: '{}', included: false}},".format(f.path) for f in ctx.files.deps])
  basePath = "/".join([".."] * len(ctx.label.package.split("/")))
  ctx.actions.expand_template(
      output = conf,
      template = ctx.file._conf_tmpl,
      substitutions = {
          "TMPL_basePath": "'{}'".format(basePath),
          "TMPL_files": files,
      })

  ctx.actions.expand_template(
      output = ctx.outputs.executable,
      template = ctx.file._runner_tmpl,
      is_executable = True,
      substitutions = {
          "TMPL_karma": ctx.executable._karma.short_path,
          "TMPL_conf": conf.short_path,
      })
  return [DefaultInfo(
      runfiles = ctx.runfiles(
          files = ctx.files._karma + ctx.files.node_modules + ctx.files.deps + [
              conf, ctx.executable._node, ctx.file._loader,
          ],
          # TODO(alexeagle): should get node binary and node_modules this way...
          # transitive_files = transitive_runfiles,
          collect_data = True,
          collect_default = True,
      ),
  )]

karma_test = rule(
    implementation = _karma_test_impl,
    attrs = {
        "deps": attr.label_list(allow_files = True),
        "_karma": attr.label(
            default = Label("//internal:karma_bin"),
            executable = True, cfg = "data", single_file = False, allow_files = True),
        # TODO(alexeagle): _node and node_modules should have been found in the transitive runfiles...
        "_node": attr.label(
            default = Label("@nodejs//:bin/node"),
            executable = True, single_file = True, cfg = "data", allow_files = True),
        "node_modules": attr.label(
            default = Label("@//:node_modules")),
        # END-TODO
        "_conf_tmpl": attr.label(
            default = Label(_CONF_TMPL),
            allow_files = True, single_file = True),
        "_runner_tmpl": attr.label(
            default = Label(_RUNNER_TMPL),
            allow_files = True, single_file = True),
        "_loader": attr.label(
            default = Label(_LOADER),
            allow_files = True, single_file = True),
    },
    test = True,
)
