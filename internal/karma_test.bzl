_CONF_TMPL = "//internal:karma.conf.js"
_LOADER = "//internal:test-main.js"

def _karma_test_impl(ctx):
  conf = ctx.actions.declare_file(
      "%s.conf.js" % ctx.label.name,
      sibling=ctx.outputs.executable)

  files = "\n".join([
      "'{}',".format(f.short_path)
      for f in ctx.files.srcs + ctx.files.deps
  ])

  basePath = "/".join([".."] * len(ctx.label.package.split("/")))
  ctx.actions.expand_template(
      output = conf,
      template =  ctx.file._conf_tmpl,
      substitutions = {
          "TMPL_basePath": basePath,
          "TMPL_files": files,
          "TMPL_manifest_path": ctx.file.manifest.short_path if ctx.file.manifest else "",
          "TMPL_concatjs": "true" if ctx.attr.concatjs else "false",
          "TMPL_workspace_name": ctx.workspace_name,
      })

  ctx.actions.write(
      output = ctx.outputs.executable,
      is_executable = True,
      content = """#!/usr/bin/env bash
readonly KARMA={TMPL_karma}
readonly CONF={TMPL_conf}
export HOME=$(mktemp -d)
ARGV=( "start" $CONF )

# Detect that we are running as a test, by using a well-known environment
# variable. See go/test-encyclopedia
if [ ! -z "$TEST_TMPDIR" ]; then
  ARGV+=( "--single-run" )
fi

$KARMA ${{ARGV[@]}}
""".format(TMPL_karma = ctx.executable._karma.short_path,
           TMPL_conf = conf.short_path))
  return [DefaultInfo(
      runfiles = ctx.runfiles(
          files = ctx.files.srcs + ctx.files.deps + [
              conf,
              ctx.file._loader,
          ] + ([ctx.file.manifest] if ctx.file.manifest else []),
          collect_data = True,
      ),
  )]

karma_test = rule(
    implementation = _karma_test_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = ["js"]),
        "deps": attr.label_list(allow_files = True),
        "data": attr.label_list(cfg = "data"),
        "concatjs": attr.bool(),
        "manifest": attr.label(allow_files = True, single_file = True),
        "_karma": attr.label(
            default = Label("//internal:karma_bin"),
            executable = True,
            cfg = "data",
            single_file = False,
            allow_files = True),
        "_conf_tmpl": attr.label(
            default = Label(_CONF_TMPL),
            allow_files = True, single_file = True),
        "_loader": attr.label(
            default = Label(_LOADER),
            allow_files = True, single_file = True),
    },
    test = True,
)

def karma_test_macro(concatjs = False, manifest = None, tags = [], data = [], **kwargs):
  if (manifest):
    concatjs = True
    data = data + [manifest]

  karma_test(
      tags = tags + ["iblaze_notify_changes"],
      # Our binary dependency must be in data[] for collect_data to pick it up
      # FIXME: maybe we can just ask the attr._karma for its runfiles attr
      data = data + ["//internal:karma_bin"],
      concatjs = concatjs,
      manifest = manifest,
      **kwargs)
