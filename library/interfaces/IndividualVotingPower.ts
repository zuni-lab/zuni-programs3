import {
  BaseClassValidator,
  ClassPropertyValidationError,
} from './BaseClassValidator';
import { IsInt, Min, Max, IsBoolean } from 'class-validator';
import { assert } from 'chai';
import { MAX_TOTAL_VOTING_POWER } from 'library/constants/IndividualVotingPowerConstants';
import { Secp256k1PublicKey } from './Secp256k1KeyStringPair.type';

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

describe('IndividualVotingPower class tests', function () {
  it('create new indivisual voting objects', async () => {
    const goodVotingPower = new IndividualVotingPower({
      votingPower: 20,
      voterPublicSigningKey: new Secp256k1PublicKey(
        '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
      ),
      voterOrder: 0,
    });
    assert.throws(() => {
      const badVotingPower = new IndividualVotingPower({
        votingPower: -1,
        voterPublicSigningKey: new Secp256k1PublicKey(
          '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
        ),
        voterOrder: 0,
      });
    }, ClassPropertyValidationError);

    assert.throws(() => {
      const badVotingPower = new IndividualVotingPower({
        votingPower: MAX_TOTAL_VOTING_POWER + 1,
        voterPublicSigningKey: new Secp256k1PublicKey(
          '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
        ),
        voterOrder: 0,
      });
    }, ClassPropertyValidationError);
  });
});
