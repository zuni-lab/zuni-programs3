import { assert } from 'chai';
import { IsInt, Max, Min } from 'class-validator';
import { MAX_TOTAL_VOTING_POWER } from 'library/constants/IndividualVotingPowerConstants';
import { genKeyPair } from 'library/Secp256k1';
import {
  BaseClassValidator,
  ClassPropertyValidationError,
} from './BaseClassValidator';
import {
  Secp256k1KeyStringPair,
  Secp256k1PublicKey,
} from './Secp256k1KeyStringPair.type';

export class IndividualVotingPower extends BaseClassValidator<IndividualVotingPower> {
  @IsInt()
  @Min(0)
  @Max(MAX_TOTAL_VOTING_POWER)
  votingPower: number;

  voterPublicSigningKey: Secp256k1PublicKey;

  @IsInt()
  @Min(0)
  voterOrder: number;

  constructor(data: {
    votingPower: number;
    voterPublicSigningKey: Secp256k1PublicKey;
    voterOrder: number;
  }) {
    super(data);
    this.votingPower = data.votingPower;
    this.voterPublicSigningKey = data.voterPublicSigningKey;
    this.voterOrder = data.voterOrder ?? 0;
  }

  clone(): IndividualVotingPower {
    return new IndividualVotingPower({
      votingPower: this.votingPower,
      voterPublicSigningKey: this.voterPublicSigningKey.clone(),
      voterOrder: this.voterOrder,
    });
  }
}

export function generateSampleVotingPowers(len: number = 100): {
  voters: Array<Secp256k1KeyStringPair>;
  votingPowers: Array<IndividualVotingPower>;
} {
  const voters: Array<Secp256k1KeyStringPair> = [];
  for (let i = 0; i < len; ++i) voters.push(genKeyPair());
  const votingPowers = voters.map(
    (voterKeyPair) =>
      new IndividualVotingPower({
        votingPower: Math.floor(Math.random() * 1000),
        voterPublicSigningKey: voterKeyPair.publicKey,
        voterOrder: 0,
      }),
  );
  return {
    voters,
    votingPowers,
  };
}

describe('IndividualVotingPower class tests', function () {
  it('create new indivisual voting objects', async () => {
    const _goodVotingPower = new IndividualVotingPower({
      votingPower: 20,
      voterPublicSigningKey: new Secp256k1PublicKey(
        '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
      ),
      voterOrder: 0,
    });
    assert.throws(() => {
      const _badVotingPower = new IndividualVotingPower({
        votingPower: -1,
        voterPublicSigningKey: new Secp256k1PublicKey(
          '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
        ),
        voterOrder: 0,
      });
    }, ClassPropertyValidationError);

    assert.throws(() => {
      const _badVotingPower_ = new IndividualVotingPower({
        votingPower: MAX_TOTAL_VOTING_POWER + 1,
        voterPublicSigningKey: new Secp256k1PublicKey(
          '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
        ),
        voterOrder: 0,
      });
    }, ClassPropertyValidationError);
  });
});
