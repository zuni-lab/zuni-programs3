import { assert } from 'chai';
import { newMemEmptyTrie } from 'circomlibjs';
import { VotingPowerSMT } from 'library/common/VotingPowerSMT';
import { MAX_TOTAL_VOTING_POWER } from 'library/constants/IndividualVotingPowerConstants';
import { ClassPropertyValidationError } from 'library/interfaces/BaseClassValidator';

describe('VotingPowerSMT class tests', function () {
  it('create new VotingPowerSMT objects', async () => {
    const tree = await newMemEmptyTrie();
    const _goodVotingPowerSMT_ = new VotingPowerSMT({
      totalVotingPower: 20,
      merkleTree: tree,
      individualVotingPowers: undefined,
    });
    assert.throws(() => {
      const _badVotingPowerSMT_ = new VotingPowerSMT({
        totalVotingPower: -1,
        merkleTree: tree,
        individualVotingPowers: [],
      });
    }, ClassPropertyValidationError);

    assert.throws(() => {
      const _badVotingPowerSMT_ = new VotingPowerSMT({
        totalVotingPower: MAX_TOTAL_VOTING_POWER + 1,
        merkleTree: tree,
        individualVotingPowers: undefined,
      });
    }, ClassPropertyValidationError);
  });
});
