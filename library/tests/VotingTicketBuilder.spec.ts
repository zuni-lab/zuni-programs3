import { assert } from 'chai';
import { BabyJubCurvePoint } from 'library/BabyJub/BabyJubBasePoint';
import { FFMathUtility } from 'library/BabyJub/FFMathUtility';
import { VotingPowerSMTBuilder } from 'library/common/VotingPowerSMTBuilder';
import { VotingTicketBuilder } from 'library/common/VotingTicketBuilder';
import { ECCCurvePoint } from 'library/interfaces/BasePoint';
import { Secp256k1CurvePoint } from 'library/Secp256k1/Secp256k1BasePoint';
import { ECCUtility } from 'library/utility/ECCUtility';
import { VotingUtility } from 'library/utility/VotingUtility';

describe('VotingTicketBuilder tests', function () {
  this.timeout(10000);

  before(async () => {
    await FFMathUtility.initialize(); // for babyjub math
  });

  async function testBuildVotingTicket<P extends ECCCurvePoint>() {
    const numberOfVoteOptions = 3;
    const { voters, votingPowers } =
      VotingUtility.generateSampleVotingPowers<P>(5);
    const votingPowerSMT = await VotingPowerSMTBuilder.buildVotingPowerSMT(
      votingPowers,
    );
    const committeePublicKey = ECCUtility.getDefaultPublicKey();

    for (let i = 0; i < voters.length; ++i) {
      const validVotePowerAllocation =
        VotingUtility.generateRandomVotePowerAllocation(
          votingPowers[i].votingPower,
          numberOfVoteOptions,
        );
      const _validVotingTicket = await VotingTicketBuilder.buildVotingTicket(
        validVotePowerAllocation,
        numberOfVoteOptions,
        voters[i],
        votingPowerSMT,
        committeePublicKey,
      );
      //
      const invalidVotePowerAllocation = validVotePowerAllocation.map((x) => x);
      invalidVotePowerAllocation[0] -= 1;

      try {
        const inValidVotingTicket = await VotingTicketBuilder.buildVotingTicket(
          invalidVotePowerAllocation,
          numberOfVoteOptions,
          voters[i],
          votingPowerSMT,
          committeePublicKey,
        );
        assert.isTrue(inValidVotingTicket == undefined);
      } catch (err) {}
    }

    return true;
  }

  it('buildVotingTicket', (done) => {
    ECCUtility.init('secp256k1');
    testBuildVotingTicket<Secp256k1CurvePoint>().then(() => done());

    ECCUtility.init('babyjub');
    testBuildVotingTicket<BabyJubCurvePoint>().then(() => done());
  });
});
