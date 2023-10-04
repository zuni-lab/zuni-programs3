import BN from 'bn.js';
import { assert } from 'chai';
import { MAX_TOTAL_VOTING_POWER } from './constants/IndividualVotingPowerConstants';
import { generateSampleVotingPowers } from './interfaces/IndividualVotingPower';
import {
  Secp256k1KeyStringPair,
  Secp256k1PublicKey,
} from './interfaces/Secp256k1KeyStringPair.type';
import { VotingPowerSMT } from './interfaces/VotingPowerSMT';
import { VotingOptionChange, VotingTicket } from './interfaces/VotingTicket';
import { buildVotingPowerSMT } from './VotingPowerSMTBuilder';

export class InvalidVotingTicketError extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

function generateRandomBN(): BN {
  const randomBytes: Array<number> = new Array(32).fill(0);
  for (let i = 0; i < randomBytes.length; ++i) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }
  return new BN(randomBytes);
}

function generateRandomVotePowerAllocation(
  userTotalVotingPower: number,
  numberOfVoteOptions: number,
): Array<number> {
  const res = new Array(numberOfVoteOptions).fill(0);
  for (let i = 0; i < userTotalVotingPower; ++i) {
    const pos = Math.floor(Math.random() * numberOfVoteOptions);
    res[pos] += 1;
  }
  return res;
}
async function buildVotingTicket(
  votingPowerAllocation: Array<number>,
  numberOfVoteOptions: number,
  voter: Secp256k1KeyStringPair,
  votingPowerSMT: VotingPowerSMT,
  committeePublicKey: Secp256k1PublicKey,
) {
  try {
    assert(numberOfVoteOptions == votingPowerAllocation.length);

    let userTotalVotingPower = 0;
    for (let i = 0; i < votingPowerAllocation.length; ++i) {
      const votingPowerAllocatedToCurrentOption = votingPowerAllocation[i];
      if (
        votingPowerAllocatedToCurrentOption > votingPowerSMT.totalVotingPower
      ) {
        throw new InvalidVotingTicketError(
          `You cannot vote more than ${MAX_TOTAL_VOTING_POWER} power!`,
        );
      }
      userTotalVotingPower += votingPowerAllocatedToCurrentOption;
    }

    // verify valid ticket
    const individualVotingPower = votingPowerSMT.individualVotingPowers?.find(
      (x) =>
        x.voterPublicSigningKey
          .toCurvePoint()
          .eq(voter.publicKey.toCurvePoint()),
    );

    if (
      !individualVotingPower ||
      individualVotingPower.votingPower != userTotalVotingPower
    ) {
      throw new InvalidVotingTicketError(
        'User does not have the right to vote.',
      );
    }

    await votingPowerSMT.verifyTotalVotingPowerOfUser(individualVotingPower);
    // generate proofs of total voting power changes for each options
    const votingOptionChanges: Array<VotingOptionChange> = [];

    for (let i = 0; i < votingPowerAllocation.length; ++i) {
      votingOptionChanges.push(
        new VotingOptionChange({
          randomness: generateRandomBN(),
          votedPowerAmount: new BN(votingPowerAllocation[i]),
          optionIndex: i,
          committeePublicKey,
        }),
      );
    }

    const validVoterMerkleProof = await votingPowerSMT.getSiblings(
      votingPowerSMT.F.e(individualVotingPower.voterOrder * 2 - 1), // voteOrder = index + 1
    );
    const votingPowerMerkleProof = await votingPowerSMT.getSiblings(
      votingPowerSMT.F.e(individualVotingPower.voterOrder * 2),
    );

    const votingTicket = new VotingTicket({
      votingOptionChanges: votingOptionChanges,
      validVoterMerkleProof,
      votingPowerMerkleProof,
    });
    return votingTicket;
  } catch (err) {
    if (err instanceof InvalidVotingTicketError) {
      throw err;
    } else {
      throw new InvalidVotingTicketError(
        err?.message ?? 'Voting power allocation is invalid',
      );
    }
  }
}
describe('VotingTicketBuilder tests', function () {
  this.timeout(10000);

  async function testBuildVotingTicket() {
    const numberOfVoteOptions = 3;
    const { voters, votingPowers } = generateSampleVotingPowers(5);
    const votingPowerSMT = await buildVotingPowerSMT(votingPowers);
    const committeePublicKey =
      Secp256k1PublicKey.getDefaultSecp256K1PublicKey();

    for (let i = 0; i < voters.length; ++i) {
      const validVotePowerAllocation = generateRandomVotePowerAllocation(
        votingPowers[i].votingPower,
        numberOfVoteOptions,
      );
      const _validVotingTicket = await buildVotingTicket(
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
        const inValidVotingTicket = await buildVotingTicket(
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
    testBuildVotingTicket().then(() => done());
  });
});
