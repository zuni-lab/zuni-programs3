include "../../circuits/circomlib/bitify.circom";
include "../../circuits/circomlib/escalarmulany.circom";

template BabyJubScalarPointMultiplier() {
    signal input point[2];
    signal input scalar;
    signal output out[2];

    component pointBits = Num2Bits(253);
    pointBits.in <== scalar;

    component mulAnyEngine = EscalarMulAny(253);

    mulAnyEngine.p <== point;

    for (var i = 0; i < 253; i++) {
        mulAnyEngine.e[i] <== pointBits.out[i];
    }

    out <== mulAnyEngine.out;
}