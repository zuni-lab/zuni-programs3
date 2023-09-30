import { BN } from 'bn.js';
import { assert } from 'chai';
import { BabyJubCurvePoint } from 'library/BabyJub/BabyJubBasePoint';
import { FFMathUtility } from 'library/BabyJub/FFMathUtility';
import { VotingOptionChange } from 'library/common/VotingOptionChange';
import { VotingTicket } from 'library/common/VotingTicket';
import { SMT_LEVEL } from 'library/constants/SMTConstants';
import { ClassPropertyValidationError } from 'library/interfaces/BaseClassValidator';
import { ECCCurvePoint } from 'library/interfaces/BasePoint';
import { Secp256k1CurvePoint } from 'library/Secp256k1/Secp256k1BasePoint';
import { ECCUtility } from 'library/utility/ECCUtility';

describe('VotingTicket class tests', function () {
  this.timeout(10000);

  before(async () => {
    await FFMathUtility.initialize(); // for babyjub math
  });

  it('create new VotingTicket object', async () => {
    const testRunner = <P extends ECCCurvePoint>() => {
      const votingOptionChanges: Array<VotingOptionChange<P>> = [];
      for (let i = 0; i < 100; ++i)
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
        });
      }, ClassPropertyValidationError);

      const _votingTicket_ = new VotingTicket({
        votingOptionChanges: votingOptionChanges,
        votingPowerMerkleProof: new Array<number>(SMT_LEVEL + 1).fill(0),
        validVoterMerkleProof: new Array<number>(SMT_LEVEL + 1).fill(0),
      });
    };

    ECCUtility.init('secp256k1');
    testRunner<Secp256k1CurvePoint>();

    ECCUtility.init('babyjub');
    testRunner<BabyJubCurvePoint>();
  });
});
