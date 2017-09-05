#!/bin/sh

readonly KARMA=TMPL_karma
readonly CONF=TMPL_conf
export HOME=/tmp
ARGV=( start $CONF )

# Detect that we are running as a test, by using a well-known environment
# variable. See https://docs.bazel.build/versions/master/test-encyclopedia.html#initial-conditions
if [ ! -z "$TEST_TMPDIR" ]; then
  ARGV+=( "--single-run")
fi

$KARMA ${ARGV[@]}
