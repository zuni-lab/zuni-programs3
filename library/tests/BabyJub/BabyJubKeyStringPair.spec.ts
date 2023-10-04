import { assert } from 'chai';
import { BabyJubCurvePoint } from 'library/BabyJub/BabyJubBasePoint';
import { FFMathUtility } from 'library/BabyJub/FFMathUtility';
import { ECCCurvePoint } from 'library/interfaces/BasePoint';

describe('BabyJubKeyStringPair class tests', function () {
  before(async () => {
    await FFMathUtility.initialize();
  });
  it('create new key string pair objects', () => {
    (async <_P extends ECCCurvePoint>() => {
      const sk = BigInt(
        '12062235059128150724140304935969637827082776004512811357721318686093323707',
      );

      const pk = FFMathUtility.mulPointEscalar(FFMathUtility.babyJub.Base8, sk);

      const expectedResult = [
        FFMathUtility.F.e(
          '16615746963028696677018428614198711496571701930924944283712342977161475370589',
        ),
        FFMathUtility.F.e(
          '17352060016259064550698589367725650417374780253567961166772033417671818251070',
        ),
      ];
      // 0  =>  12062235059128150724140304935969637827082776004512811357721318686093323707  * G =  16615746963028696677018428614198711496571701930924944283712342977161475370589 / 17352060016259064550698589367725650417374780253567961166772033417671818251070
      assert.equal(pk.toString(), expectedResult.toString());
    })<BabyJubCurvePoint>();
  });
});
