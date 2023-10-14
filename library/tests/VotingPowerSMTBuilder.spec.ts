import { assert } from 'chai';
import { BabyJubCurvePoint } from '../BabyJub/BabyJubBasePoint';
import { FFMathUtility } from '../BabyJub/FFMathUtility';
import { ECCCurvePoint } from '../interfaces/BasePoint';
import { VotingPowerSMTBuilder } from '../private_voting/VotingPowerSMTBuilder';
import { Secp256k1CurvePoint } from '../Secp256k1/Secp256k1BasePoint';
import { ECCUtility } from '../utility/ECCUtility';
import { VotingUtility } from '../utility/VotingUtility';

describe('VotingPowerSMTBuilder tests', function () {
  this.timeout(5000);

  before(async () => {
    await FFMathUtility.initialize(); // for babyjub math
  });

  async function testBuildVotingPowerSMT<_P extends ECCCurvePoint>() {
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

  it('buildVotingPowerSMT', () => {
    it('secp256k1', (done) => {
      ECCUtility.init('secp256k1');
      testBuildVotingPowerSMT<Secp256k1CurvePoint>().then(() => done());
    });
    it('babyjub', (done) => {
      ECCUtility.init('babyjub');
      testBuildVotingPowerSMT<BabyJubCurvePoint>().then(() => done());
    });
  });
});
