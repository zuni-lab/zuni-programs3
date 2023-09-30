import { assert } from 'chai';
import { VotingPowerSMTBuilder } from 'library/common/VotingPowerSMTBuilder';
import { BasePoint } from 'library/interfaces/BasePoint';
import { Secp256k1BasePoint } from 'library/Secp256k1/Secp256k1BasePoint';
import { VotingUtility } from 'library/utility/VotingUtility';

describe('VotingPowerSMTBuilder tests', function () {
  this.timeout(5000);

  async function testBuildVotingPowerSMT<P extends BasePoint<P>>() {
    const { voters: _voters_, votingPowers } =
      VotingUtility.generateSampleVotingPowers(100);

    const votingPowerSMT = await VotingPowerSMTBuilder.buildVotingPowerSMT(
      votingPowers,
    );

    const sortedVotingPowers =
      VotingPowerSMTBuilder.getSortedVotingPowers(votingPowers);

    for (let i = 0; i < sortedVotingPowers.length; ++i) {
      const isVoterIncluded = await votingPowerSMT.verifyTotalVotingPowerOfUser(
        sortedVotingPowers[i],
      );
      assert.equal(isVoterIncluded, true);

      //

      const wrongVotingPower = sortedVotingPowers[i].clone();
      wrongVotingPower.votingPower += 1;

      const isWrongVoterIncluded =
        await votingPowerSMT.verifyTotalVotingPowerOfUser(wrongVotingPower);
      assert.equal(isWrongVoterIncluded, false);
    }
    return true;
  }

  it('buildVotingPowerSMT<P>', (done) => {
    testBuildVotingPowerSMT<Secp256k1BasePoint>().then(() => done());
  });
});
