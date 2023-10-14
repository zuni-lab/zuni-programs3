import { BN } from 'bn.js';
import { assert } from 'chai';
import { BabyJubCurvePoint } from '../BabyJub/BabyJubBasePoint';
import { FFMathUtility } from '../BabyJub/FFMathUtility';
import {
  MAX_NUMBER_OF_VOTE_OPTIONS,
  SMT_LEVEL,
} from '../constants/VotingConstants';
import { ClassPropertyValidationError } from '../interfaces/BaseClassValidator';
import { ECCCurvePoint } from '../interfaces/BasePoint';
import { VotingOptionChange } from '../private_voting/VotingOptionChange';
import { VotingTicket } from '../private_voting/VotingTicket';
import { Secp256k1CurvePoint } from '../Secp256k1/Secp256k1BasePoint';
import { ECCUtility } from '../utility/ECCUtility';

describe('VotingTicket class tests', function () {
  this.timeout(10000);

  before(async () => {
    await FFMathUtility.initialize(); // for babyjub math
  });

  it('create new VotingTicket object', async () => {
    const testRunner = <P extends ECCCurvePoint>() => {
      const votingOptionChanges: Array<VotingOptionChange<P>> = [];
      for (let i = 0; i < MAX_NUMBER_OF_VOTE_OPTIONS; ++i)
        votingOptionChanges.push(
          new VotingOptionChange({
            randomness: new BN(Math.random() * 1000),
            votedPowerAmount: new BN(Math.random() * 1000),
            optionIndex: i,
            committeePublicKey: ECCUtility.getDefaultPublicKey(),
          }),
        );

      assert.throws(() => {
        const _votingTicket_ = new VotingTicket({
          votingOptionChanges: votingOptionChanges,
          votingPowerMerkleProof: [0],
          validVoterMerkleProof: [0],
          voterKeyPair: ECCUtility.genKeyPair(),
          committeePublicKey: ECCUtility.getDefaultPublicKey(),
          voterIndex: 0,
        });
      }, ClassPropertyValidationError);

      const _votingTicket_ = new VotingTicket({
        votingOptionChanges: votingOptionChanges,
        votingPowerMerkleProof: new Array<number>(SMT_LEVEL).fill(0),
        validVoterMerkleProof: new Array<number>(SMT_LEVEL).fill(0),
        voterKeyPair: ECCUtility.genKeyPair(),
        committeePublicKey: ECCUtility.getDefaultPublicKey(),
        voterIndex: 0,
      });
    };

    ECCUtility.init('secp256k1');
    testRunner<Secp256k1CurvePoint>();

    ECCUtility.init('babyjub');
    testRunner<BabyJubCurvePoint>();
  });
});
