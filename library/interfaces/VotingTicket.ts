import BN from 'bn.js';
import { assert } from 'chai';
import { BigNumberish } from 'circomlibjs';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { curve, ec as EC } from 'elliptic';
import { SMT_LEVEL } from 'library/constants/SMTConstants';
import { MAX_NUMBER_OF_VOTE_OPTIONS } from 'library/constants/VotingConstants';
import {
  BaseClassValidator,
  ClassPropertyValidationError,
} from './BaseClassValidator';
import { Secp256k1PublicKey } from './Secp256k1KeyStringPair.type';
const ec = new EC('secp256k1');

export class VotingOptionChange extends BaseClassValidator<VotingOptionChange> {
  @IsInt()
  @Min(0)
  @Max(MAX_NUMBER_OF_VOTE_OPTIONS)
  optionIndex: number; // index starts from 0

  randomness: BN;
  votedPowerAmount: BN;
  encryptedRandomness: curve.base.BasePoint;
  encryptedMaskedVotingPowerAllocated: curve.base.BasePoint;
  committeePublicKey: Secp256k1PublicKey;

  constructor(data: {
    randomness: BN;
    votedPowerAmount: BN;
    optionIndex: number;
    committeePublicKey: Secp256k1PublicKey;
  }) {
    super(data);
    this.randomness = data.randomness;
    this.votedPowerAmount = data.votedPowerAmount;
    this.optionIndex = data.optionIndex;
    this.encryptedRandomness = (ec.g as curve.base.BasePoint).mul(
      this.randomness,
    );
    this.committeePublicKey = data.committeePublicKey;
    this.encryptedMaskedVotingPowerAllocated = (ec.g as curve.base.BasePoint)
      .mul(this.votedPowerAmount)
      .add(data.committeePublicKey.toCurvePoint().mul(this.randomness));
  }

  clone(): VotingOptionChange {
    return new VotingOptionChange({
      randomness: this.randomness,
      votedPowerAmount: this.votedPowerAmount,
      optionIndex: this.optionIndex,
      committeePublicKey: this.committeePublicKey,
    });
  }
}

export class VotingTicket extends BaseClassValidator<VotingTicket> {
  @IsArray()
  votingOptionChanges: Array<VotingOptionChange>;

  @IsArray()
  @ArrayMinSize(SMT_LEVEL + 1)
  @ArrayMaxSize(SMT_LEVEL + 1)
  votingPowerMerkleProof: Array<BigNumberish>;

  validVoterMerkleProof: Array<BigNumberish>;

  constructor(data: {
    votingOptionChanges: Array<VotingOptionChange>;
    votingPowerMerkleProof: Array<BigNumberish>;
    validVoterMerkleProof: Array<BigNumberish>;
  }) {
    super(data);
    this.votingOptionChanges = data.votingOptionChanges;
    this.votingPowerMerkleProof = data.votingPowerMerkleProof;
    this.validVoterMerkleProof = data.validVoterMerkleProof;
  }

  clone(): VotingTicket {
    return new VotingTicket({
      votingOptionChanges: this.votingOptionChanges,
      votingPowerMerkleProof: this.votingPowerMerkleProof.map((x) => x),
      validVoterMerkleProof: this.validVoterMerkleProof.map((x) => x),
    });
  }
}

describe('VotingTicket class tests', function () {
  it('create new VotingTicket object', async () => {
    const votingOptionChanges: Array<VotingOptionChange> = [];
    for (let i = 0; i < 100; ++i)
      votingOptionChanges.push(
        new VotingOptionChange({
          randomness: new BN(Math.random() * 1000),
          votedPowerAmount: new BN(Math.random() * 1000),
          optionIndex: i,
          committeePublicKey: Secp256k1PublicKey.getDefaultSecp256K1PublicKey(),
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
  });
});
