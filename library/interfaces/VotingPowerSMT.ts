import {
  BaseClassValidator,
  ClassPropertyValidationError,
} from './BaseClassValidator';
import { IsInt, Min, Max } from 'class-validator';
import { assert } from 'chai';
import { MAX_TOTAL_VOTING_POWER } from 'library/constants/IndividualVotingPowerConstants';
import { BigNumberish, SMT, SMTMemDb, newMemEmptyTrie } from 'circomlibjs';
import { IndividualVotingPower } from './IndividualVotingPower';
import { WasmField1Interface } from './WasmField1Interface';

export class VotingPowerSMT extends BaseClassValidator<VotingPowerSMT> {
  @IsInt()
  @Min(0)
  @Max(MAX_TOTAL_VOTING_POWER)
  totalVotingPower: number;

  merkleTree: SMT;

  F: WasmField1Interface;

  individualVotingPowers: Array<IndividualVotingPower> | undefined;

  constructor(data: {
    totalVotingPower: number;
    merkleTree: SMT;
    individualVotingPowers?: Array<IndividualVotingPower>;
  }) {
    super(data);
    this.totalVotingPower = data.totalVotingPower;
    this.merkleTree = data.merkleTree;
    this.F = this.merkleTree.F;
    this.individualVotingPowers = data.individualVotingPowers;
  }

  private async verifyKeyValuePairInSMT(
    key: Uint8Array,
    value: Uint8Array,
  ): Promise<boolean> {
    const res = await this.merkleTree.find(key);
    return (
      res.found && res.foundValue && this.F.eq(res.foundValue, this.F.e(value))
    );
  }

  async verifyUser(voter: IndividualVotingPower): Promise<boolean> {
    const index = voter.voterOrder - 1;
    const isVoterIdIncluded = await this.verifyKeyValuePairInSMT(
      this.F.e(index * 2 + 1),
      this.merkleTree.F.e(voter.voterPublicSigningKey.toVoterId()),
    );
    const isVotingPowerIncluded = await this.verifyKeyValuePairInSMT(
      this.F.e(index * 2 + 2),
      this.F.e(voter.votingPower),
    );
    return isVoterIdIncluded && isVotingPowerIncluded;
  }

  clone(): VotingPowerSMT {
    // clone mem db
    const newMemDb = new SMTMemDb(this.merkleTree.F);
    newMemDb.setRoot(this.merkleTree.root);
    newMemDb.nodes = {};
    for (const nodeKey in this.merkleTree.F.nodes) {
      newMemDb.nodes[nodeKey] = this.merkleTree.F.nodes[nodeKey];
    }
    // clone the tree
    return new VotingPowerSMT({
      totalVotingPower: this.totalVotingPower,
      merkleTree: new SMT(
        newMemDb,
        this.merkleTree.root,
        this.merkleTree.hash0,
        this.merkleTree.hash1,
        this.merkleTree.F,
      ),
      individualVotingPowers: this.individualVotingPowers?.map((x) =>
        x.clone(),
      ),
    });
  }
}

describe('VotingPowerSMT class tests', function () {
  it('create new VotingPowerSMT objects', async () => {
    const tree = await newMemEmptyTrie();
    const goodVotingPowerSMT = new VotingPowerSMT({
      totalVotingPower: 20,
      merkleTree: tree,
      individualVotingPowers: undefined,
    });
    assert.throws(() => {
      const badVotingPowerSMT = new VotingPowerSMT({
        totalVotingPower: -1,
        merkleTree: tree,
        individualVotingPowers: [],
      });
    }, ClassPropertyValidationError);

    assert.throws(() => {
      const badVotingPowerSMT = new VotingPowerSMT({
        totalVotingPower: MAX_TOTAL_VOTING_POWER + 1,
        merkleTree: tree,
        individualVotingPowers: undefined,
      });
    }, ClassPropertyValidationError);
  });
});
