#!/bin/sh

readonly KARMA=TMPL_karma
readonly CONF=TMPL_conf
export HOME=/tmp
find example
find internal
find external
pwd
ARGV=( start $CONF )

# Detect that we are running as a test, by using a well-known environment
# variable. See go/test-encyclopedia
if [ ! -z "$TEST_TMPDIR" ]; then
  ARGV+=( "--single-run")
fi

$KARMA ${ARGV[@]}
