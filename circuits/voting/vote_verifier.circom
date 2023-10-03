pragma circom 2.0.0;

include "../../circuits/circomlib/smt/smtverifier.circom";
include "../../circuits/circomlib/comparators.circom";
include "./babyjub_customized.circom";

// @static_params:
// - MAX_NUMBER_OF_VOTE_OPTIONS
// - SMT_LEVEL

template SMTKeyValuePairsVerifier(SMT_LEVEL){
  signal input root;
  signal input key;
  signal input value;
  signal input siblings[SMT_LEVEL];
  component smt_checker = SMTVerifier(SMT_LEVEL);

  smt_checker.enabled <== 1;
  smt_checker.root <== root;
  smt_checker.siblings <== siblings;
  smt_checker.oldKey <== 0;
  smt_checker.oldValue <== 0;
  smt_checker.isOld0 <== 0;
  smt_checker.key <== key;
  smt_checker.value <== value;
  smt_checker.fnc <== 0; // inclusion
}

function toVoterId(x, y){
  return x * y + x + y;
}

template VoteVerifier(MAX_NUMBER_OF_VOTE_OPTIONS, SMT_LEVEL) {
    signal input committeePublicKey[2];
    signal input encryptedRandomness[MAX_NUMBER_OF_VOTE_OPTIONS][2];
    signal input encryptedMaskedVotingPowerAllocated[MAX_NUMBER_OF_VOTE_OPTIONS][2];
    signal input votingPowerMerkleTreeRoot;

    // private inputs
    signal input votedPowerAmount[MAX_NUMBER_OF_VOTE_OPTIONS];
    signal input randomness[MAX_NUMBER_OF_VOTE_OPTIONS];
    signal input voterPK[2];
    signal input voterIndex; // position of voter in the list starts from 0
    signal input proofOfVoterId[SMT_LEVEL];
    signal input proofOfVotingPower[SMT_LEVEL];

    var totalVotedPowerAmount = 0;
    var totalRandomness = 0;
    for(var i = 0; i < MAX_NUMBER_OF_VOTE_OPTIONS; i++){
      totalVotedPowerAmount = totalVotedPowerAmount + votedPowerAmount[i];
      totalRandomness = totalRandomness + randomness[i];
    }

    // validate voting power SMT
    // TODO: make sure these values are non-duplicated
    // index * 2 + 1 => VPK[0] * VPK[1] + VPK[0] + VPK[1]
    // index * 2 + 2 => totalVotedPowerAmount

    SMTKeyValuePairsVerifier(SMT_LEVEL)(votingPowerMerkleTreeRoot, voterIndex * 2 + 1, toVoterId(voterPK[0], voterPK[1]), proofOfVoterId);
    SMTKeyValuePairsVerifier(SMT_LEVEL)(votingPowerMerkleTreeRoot, voterIndex * 2 + 2, totalVotedPowerAmount, proofOfVotingPower);

    // validate point calculations
    component comp_votePower_G[MAX_NUMBER_OF_VOTE_OPTIONS];
    component comp_randomness_PK[MAX_NUMBER_OF_VOTE_OPTIONS];
    component comp_M[MAX_NUMBER_OF_VOTE_OPTIONS];
    component comp_R[MAX_NUMBER_OF_VOTE_OPTIONS];

    for (var i = 0; i < MAX_NUMBER_OF_VOTE_OPTIONS; i++) {
        comp_votePower_G[i] = BabyPbk();
        comp_votePower_G[i].in <== votedPowerAmount[i];

        comp_randomness_PK[i] = BabyJubScalarPointMultiplier();
        comp_randomness_PK[i].scalar <== randomness[i];
        comp_randomness_PK[i].point <== committeePublicKey;

        // R[i] = randomness[i] * G
        comp_R[i] = BabyPbk();
        comp_R[i].in <== randomness[i];
        comp_R[i].Ax === encryptedRandomness[i][0];
        comp_R[i].Ay === encryptedRandomness[i][1];

        // M[i] = votedPowerAmount[i] * G + randomness[i] * PK
        comp_M[i] = BabyAdd();
        comp_M[i].x1 <== comp_randomness_PK[i].out[0];
        comp_M[i].y1 <== comp_randomness_PK[i].out[1];
        comp_M[i].x2 <== comp_votePower_G[i].Ax;
        comp_M[i].y2 <== comp_votePower_G[i].Ay;

        comp_M[i].xout === encryptedMaskedVotingPowerAllocated[i][0];
        comp_M[i].yout === encryptedMaskedVotingPowerAllocated[i][1];
    }    
}

component main {public [committeePublicKey, encryptedRandomness, encryptedMaskedVotingPowerAllocated]} = VoteVerifier(5, 8);