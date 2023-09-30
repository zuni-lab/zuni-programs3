pragma circom 2.0.0;

include "../../circuits/circomlib/smt/smtverifier.circom";
include "../../circuits/circomlib/comparators.circom";

// @static_params:
// - NUM_VOTE_OPTIONS
// - SMT_LEVEL

template SMTKeyValuePairsVerifier(MAX_VALUE_CHUNK, SMT_LEVEL){
  signal input root;
  signal input proof[SMT_LEVEL + 2]; // fKey, fValue, siblings ...
  signal input rawValue[MAX_VALUE_CHUNK];
  component smt_checker = SMTVerifier(SMT_LEVEL);

  ValueEncodingValidator(MAX_VALUE_CHUNK)(proof[1], rawValue);

  smt_checker.enabled <== 1;
  smt_checker.root <== root;

  for (var k = 0; k < SMT_LEVEL; k++) {
    smt_checker.siblings[k] <== proof[k + 2];
  }
  
  smt_checker.oldKey <== 0;
  smt_checker.oldValue <== 0;
  smt_checker.isOld0 <== 0;
  smt_checker.key <== proof[0];
  smt_checker.value <== proof[1];
  smt_checker.fnc <== 0; // inclusion
}

template VCVerifier(MAX_NUM_CHECKS, MAX_CHECK_SIZE, MAX_VALUE_CHUNK, SMT_LEVEL){
  signal input votingPowerMerkleTreeRoot;
  signal input voterOrder; // position of voter in the list
  signal input proofOfVoterId[SMT_LEVEL + 1];
  signal input proofOfVotingPower[SMT_LEVEL + 1];

  signal output out;

  // validate voter's info included in the tree
  var tmp[SMT_LEVEL + 2];

  

  // each credential/schema check must consists of only valid key-value pair
  var tmp[SMT_LEVEL + 2];
  for(var i = 0; i < MAX_NUM_CHECKS; i++){
    for(var j = 0; j < MAX_CHECK_SIZE; j++){
      /////////////////////////////////////////////////////////////////////////////////////////////////
      tmp[0] = credentialsFieldIndex[i][j];
      for(var k = 0; k < SMT_LEVEL + 1; k++){
        tmp[k + 1] = credentialsProof[i][j][k];
      }
      
      SMTKeyValuePairsVerifier(MAX_VALUE_CHUNK, SMT_LEVEL)(
        credentialRoots[i],
        tmp,
        credentialsValue[i][j]
      );
      /////////////////////////////////////////////////////////////////////////////////////////////////
      tmp[0] = schemaChecksFieldIndex[i][j];
      for(var k = 0; k < SMT_LEVEL + 1; k++){
        tmp[k + 1] = schemaChecksProof[i][j][k];
      }

      SMTKeyValuePairsVerifier(MAX_VALUE_CHUNK, SMT_LEVEL)(
        schemaCheckRoots[i],
        tmp,
        schemaChecksValue[i][j]
      );
    }
  }

  component cmp[MAX_NUM_CHECKS][MAX_CHECK_SIZE];
  // each credential must satisfy the corresponding check
  for(var i = 0; i < MAX_NUM_CHECKS; i++){
    for(var j = 0; j < MAX_CHECK_SIZE; j++){
      // log("i =  ", i);
      // log(" j = ", j);
      cmp[i][j] = ChunkComparator(MAX_VALUE_CHUNK);
      cmp[i][j].a <== credentialsValue[i][j];
      cmp[i][j].b <== schemaChecksValue[i][j];
      cmp[i][j].op <== schemaChecksOperation[i][j];

      cmp[i][j].out === 1;
    }
  }
}

// vote
template Vote() {
    signal input PK[2];
    signal input votePower;
    signal input R[3][2];
    signal input M[3][2];

    // Private
    signal input o;
    signal input r[3];

    component o2bits = Num2Bits(3);
    o2bits.in <== o;

    // Ensure exactly one bit is set.
    1 === o2bits.out[0] + o2bits.out[1] + o2bits.out[2];

    component comp_ov_G[3];
    component comp_r_PK[3];
    component comp_M[3];
    component comp_R[3];

    for (var i = 0; i < 3; i++) {
        var ov = votePower * o2bits.out[i];

        comp_ov_G[i] = BabyScaleGenerator();
        comp_ov_G[i].in <== ov;

        comp_r_PK[i] = JubScalarMulAny();
        comp_r_PK[i].in <== r[i];
        comp_r_PK[i].p <== PK;

        // M_i = ov_i*G + r_i*PK
        comp_M[i] = BabyAdd();
        comp_M[i].x1 <== comp_r_PK[i].out[0];
        comp_M[i].y1 <== comp_r_PK[i].out[1];
        comp_M[i].x2 <== comp_ov_G[i].Ax;
        comp_M[i].y2 <== comp_ov_G[i].Ay;

        comp_M[i].xout === M[i][0];
        comp_M[i].yout === M[i][1];

        // R_i = r_i*G
        comp_R[i] = BabyScaleGenerator();
        comp_R[i].in <== r[i];

        comp_R[i].Ax === R[i][0];
        comp_R[i].Ay === R[i][1];
    }
}

component main {public [PK, votePower, R, M]} = Vote();

component main {public [credentialRoots, schemaCheckRoots, credentialsFieldIndex, schemaChecksFieldIndex, schemaChecksOperation ]} = VCVerifier(1, 6, 4, 6);