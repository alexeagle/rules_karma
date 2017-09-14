_CONF_TMPL = "//internal:karma.conf.js"
_RUNNER_TMPL = "//internal:run_karma.sh"
_LOADER = "//internal:test-main.js"

def _sources_aspect_impl(target, ctx):
  result = depset()
  if hasattr(ctx.rule.attr, "deps"):
    for dep in ctx.rule.attr.deps:
      if hasattr(dep, "karma_sources"):
        result += dep.karma_sources
  # Note layering: until we have JS interop providers, this needs to know how to
  # get TypeScript outputs.
  if hasattr(target, "typescript"):
    result += target.typescript.es5_sources
  return struct(karma_sources = result)

_sources_aspect = aspect(
    _sources_aspect_impl,
    attr_aspects = ["deps"],
)

def _karma_test_impl(ctx):
  conf = ctx.actions.declare_file(
      "{}.conf.js".format(ctx.label.name),
      sibling=ctx.outputs.executable)
  karma_sources = depset()
  for d in ctx.attr.deps:
    if hasattr(d, "karma_sources"):
      karma_sources += d.karma_sources

  files = "\n".join([
      "'{}',".format(f.short_path)
      for f in karma_sources
  ])
  basePath = "/".join([".."] * len(ctx.label.package.split("/")))
  ctx.actions.expand_template(
      output = conf,
      template = ctx.file._conf_tmpl,
      substitutions = {
          "TMPL_basePath": basePath,
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
          files = ctx.files._karma + ctx.files.node_modules + karma_sources.to_list() + [
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
        "deps": attr.label_list(
            aspects = [_sources_aspect],
            allow_files = True),
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
