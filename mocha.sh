#!/bin/bash

TESTNAME=$1

yarn mocha ./library --recursive -g "$TESTNAME"