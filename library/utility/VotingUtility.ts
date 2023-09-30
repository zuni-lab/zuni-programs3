import { IndividualVotingPower } from 'library/common/IndividualVotingPower';
import { BasePoint } from 'library/interfaces/BasePoint';
import { ECCKeyStringPair } from 'library/interfaces/ECCKeyStringPair';
import { Secp256k1KeyStringPair } from 'library/Secp256k1/Secp256k1KeyStringPair';
import { Secp256k1Utility } from 'library/Secp256k1/Secp256k1Utility';
import { ECCUtility } from './ECCUtility';

export class VotingUtility {
  // genKeyPair
  static genKeyPair<P extends BasePoint<P>>(): ECCKeyStringPair<P>;
  static genKeyPair<Secp256k1BasePoint>(): Secp256k1KeyStringPair {
    return Secp256k1Utility.genKeyPair();
  }

  static generateSampleVotingPowers<P extends BasePoint<P>>(
    len: number,
  ): {
    voters: Array<ECCKeyStringPair<P>>;
    votingPowers: Array<IndividualVotingPower<P>>;
  };
  static generateSampleVotingPowers<Secp256k1BasePoint>(len: number = 100): {
    voters: Array<ECCKeyStringPair<BasePoint<Secp256k1BasePoint>>>;
    votingPowers: Array<IndividualVotingPower<BasePoint<Secp256k1BasePoint>>>;
  } {
    const voters: Array<ECCKeyStringPair<BasePoint<Secp256k1BasePoint>>> = [];
    for (let i = 0; i < len; ++i)
      voters.push(ECCUtility.genKeyPair<BasePoint<Secp256k1BasePoint>>());
    const votingPowers = voters.map(
      (voterKeyPair) =>
        new IndividualVotingPower({
          votingPower: Math.floor(Math.random() * 1000),
          voterPublicSigningKey: voterKeyPair.getPublicKey().clone(),
          voterOrder: 0,
        }),
    );
    return {
      voters,
      votingPowers,
    };
  }

  static generateRandomVotePowerAllocation(
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
}
