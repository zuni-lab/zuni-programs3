#!/bin/bash

TESTNAME=$1

yarn mocha ./library --recursive --require ts-node/register -g "$TESTNAME"