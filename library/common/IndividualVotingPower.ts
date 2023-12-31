import { IsInt, Max, Min } from 'class-validator';
import { MAX_TOTAL_VOTING_POWER } from '../constants/IndividualVotingPowerConstants';
import { BaseClassValidator } from '../interfaces/BaseClassValidator';
import { ECCCurvePoint } from '../interfaces/BasePoint';
import { ECCPublicKeyInterface } from '../interfaces/ECCPublicKey';

export class IndividualVotingPower<
  P extends ECCCurvePoint,
> extends BaseClassValidator<IndividualVotingPower<P>> {
  @IsInt()
  @Min(0)
  @Max(MAX_TOTAL_VOTING_POWER)
  votingPower: number;

  voterPublicSigningKey: ECCPublicKeyInterface<P>;

  @IsInt()
  @Min(0)
  voterOrder: number;

  constructor(data: {
    votingPower: number;
    voterPublicSigningKey: ECCPublicKeyInterface<P>;
    voterOrder: number;
  }) {
    super(data);
    this.votingPower = data.votingPower;
    this.voterPublicSigningKey = data.voterPublicSigningKey;
    this.voterOrder = data.voterOrder ?? 0;
  }

  clone(): IndividualVotingPower<P> {
    return new IndividualVotingPower({
      votingPower: this.votingPower,
      voterPublicSigningKey: this.voterPublicSigningKey.clone(),
      voterOrder: this.voterOrder,
    });
  }
}
