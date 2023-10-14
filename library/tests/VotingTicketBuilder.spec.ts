import { assert } from 'chai';
import { BabyJubCurvePoint } from '../BabyJub/BabyJubBasePoint';
import { FFMathUtility } from '../BabyJub/FFMathUtility';
import { MAX_NUMBER_OF_VOTE_OPTIONS } from '../constants/VotingConstants';
import { ECCCurvePoint } from '../interfaces/BasePoint';
import { VotingPowerSMTBuilder } from '../private_voting/VotingPowerSMTBuilder';
import { VotingTicketBuilder } from '../private_voting/VotingTicketBuilder';
import { Secp256k1CurvePoint } from '../Secp256k1/Secp256k1BasePoint';
import { ECCUtility } from '../utility/ECCUtility';
import { VotingUtility } from '../utility/VotingUtility';

describe('VotingTicketBuilder tests', function () {
  this.timeout(10000);

  before(async () => {
    await FFMathUtility.initialize(); // for babyjub math
  });

  async function testBuildVotingTicket<P extends ECCCurvePoint>() {
    const numberOfVoteOptions = MAX_NUMBER_OF_VOTE_OPTIONS;
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

  it('buildVotingTicket', () => {
    (async () => {
      ECCUtility.init('secp256k1');
      await testBuildVotingTicket<Secp256k1CurvePoint>();

      ECCUtility.init('babyjub');
      await testBuildVotingTicket<BabyJubCurvePoint>();
    })();
  });
});
