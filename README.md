ZUNI PROGRAMS V3

### Testing with mocha

- Run a single test in a .ts file: `./mocha.sh $TEST_NAME`
  For example: `./mocha.sh VotingPowerSMTBuilder` or `./mocha.sh 'VotingPowerSMTBuilder tests'`
- Run all tests in library: `yarn testlib`
- Run tests in a specific folder: `yarn test $FOLDER_NAME`

### Attribution

- We acknowledge the utilization of the Rust groth16 verifier developed by [Electron-Labs](https://github.com/Electron-Labs/electron-rs), which leverages the [ark_groth16](https://github.com/arkworks-rs/groth16) library.
