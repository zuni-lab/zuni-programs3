import { assert } from 'chai';
import {
  BigNumberish,
  buildPoseidon,
  newMemEmptyTrie,
  SMT,
  SMTMemDb,
} from 'circomlibjs';
import { getCurveFromName } from 'ffjavascript';
import { SMT_LEVEL } from './constants/SMTConstants';
import { IndividualVotingPower } from './interfaces/IndividualVotingPower';
import { Secp256k1KeyStringPair } from './interfaces/Secp256k1KeyStringPair.type';
import { VotingPowerSMT } from './interfaces/VotingPowerSMT';
import { WasmField1Interface } from './interfaces/WasmField1Interface';
import { genKeyPair } from './Secp256k1';

type hashFn = (left: BigNumberish, right: BigNumberish) => Uint8Array;

async function getHashes(): Promise<{
  hash0: hashFn;
  hash1: hashFn;
  F: WasmField1Interface;
}> {
  const bn128 = await getCurveFromName('bn128', true);
  const poseidon = await buildPoseidon();
  return {
    hash0: function (left, right) {
      return poseidon([left, right]);
    },
    hash1: function (key, value) {
      return poseidon([key, value, bn128.Fr.one]);
    },
    F: bn128.Fr,
  };
}
async function createSMT(
  hash0: hashFn,
  hash1: hashFn,
  F: WasmField1Interface,
  initialRoot: BigNumberish = 0,
) {
  const db = new SMTMemDb(F);
  const smt = new SMT(db, initialRoot, hash0, hash1, F);
  return smt;
}

function getSortedVotingPowers(
  votingPowers: Array<IndividualVotingPower>,
): Array<IndividualVotingPower> {
  const sortedVotingPowers = votingPowers
    .map((x) => x.clone())
    .sort((v1, v2) => {
      const isDiff =
        v1.voterPublicSigningKey.toHexString() !=
        v2.voterPublicSigningKey.toHexString();
      return isDiff
        ? v1.voterPublicSigningKey.toHexString() <
          v2.voterPublicSigningKey.toHexString()
          ? -1
          : 1
        : 0;
    })
    .map((value, index) => {
      value.voterOrder = index + 1;
      return value;
    });
  return sortedVotingPowers;
}
async function getSMTSiblings(
  tree: SMT,
  key: number,
): Promise<Array<BigNumberish>> {
  const siblings: Array<BigNumberish> = await tree.find(key).siblings;
  while (siblings.length < SMT_LEVEL) siblings.push(0);
  return siblings;
}

export async function buildVotingPowerSMT(
  votingPowers: Array<IndividualVotingPower>,
): Promise<VotingPowerSMT> {
  const sortedVotingPowers = getSortedVotingPowers(votingPowers);

  const smt: SMT = await newMemEmptyTrie(); //
  const Fr: WasmField1Interface = smt.F; // WasmField1
  let totalVotingPower = 0;

  for (let i = 0; i < sortedVotingPowers.length; ++i) {
    totalVotingPower += sortedVotingPowers[i].votingPower;
    // TODO: @galin-chung-nguyen make sure there is no duplicated key
    await smt.insert(
      Fr.e(i * 2 + 1),
      sortedVotingPowers[i].voterPublicSigningKey.toVoterId(),
    );
    await smt.insert(Fr.e(i * 2 + 2), Fr.e(sortedVotingPowers[i].votingPower));
  }

  const smtContainer = new VotingPowerSMT({
    totalVotingPower,
    merkleTree: smt,
    individualVotingPowers: sortedVotingPowers,
  });

  return smtContainer;
}

describe('VotingPowerSMTBuilder tests', function () {
  this.timeout(5000);

  async function testBuildVotingPowerSMT() {
    const voters: Array<Secp256k1KeyStringPair> = [];
    for (let i = 0; i < 100; ++i) voters.push(genKeyPair());
    const votingPowers = voters.map(
      (voterKeyPair) =>
        new IndividualVotingPower({
          votingPower: Math.floor(Math.random() * 1000),
          voterPublicSigningKey: voterKeyPair.publicKey,
          voterOrder: 0,
        }),
    );

    const votingPowerSMT = await buildVotingPowerSMT(votingPowers);

    const sortedVotingPowers = getSortedVotingPowers(votingPowers);

    for (let i = 0; i < sortedVotingPowers.length; ++i) {
      const isVoterIncluded = await votingPowerSMT.verifyUser(
        sortedVotingPowers[i],
      );
      assert.equal(isVoterIncluded, true);

      //

      const wrongVotingPower = sortedVotingPowers[i].clone();
      wrongVotingPower.votingPower += 1;

      const isWrongVoterIncluded = await votingPowerSMT.verifyUser(
        wrongVotingPower,
      );
      assert.equal(isWrongVoterIncluded, false);
    }
    return true;
  }

  it('buildVotingPowerSMT', (done) => {
    testBuildVotingPowerSMT().then(() => done());
  });
});
