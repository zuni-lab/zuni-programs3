import { BabyJubUtility } from '../BabyJub/BabyJubUtility';
import { BasePoint, ECCCurvePoint } from '../interfaces/BasePoint';
import { InvalidContextError } from '../interfaces/InvalidContextError';
import { Secp256k1Utility } from '../Secp256k1/Secp256k1Utility';

export class CurvePointBasedUtility {
  private static context: BasePoint<ECCCurvePoint> | null = null;

  static assertContextInitialized(): BasePoint<ECCCurvePoint> {
    if (!CurvePointBasedUtility.context) {
      throw new Error('Utility context is not initialized yet');
    }
    return CurvePointBasedUtility.context;
  }

  static initialize<P extends ECCCurvePoint>(context: BasePoint<P>) {
    CurvePointBasedUtility.context = context;
  }

  static init(curveName: string) {
    curveName = curveName.toLowerCase().trim();
    if (curveName == 'secp256k1') {
      CurvePointBasedUtility.context = Secp256k1Utility.getGenerator();
    } else if (curveName == 'babyjub') {
      CurvePointBasedUtility.context = BabyJubUtility.getGenerator();
    } else {
      throw new InvalidContextError(
        `${curveName} is not a supported ECC curve`,
      );
    }
  }
}
