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
  // SMT roots
  signal input credentialRoots[MAX_NUM_CHECKS];
  signal input schemaCheckRoots[MAX_NUM_CHECKS];
  // the credentials below must MATCH the schema checks
  signal input credentialsProof[MAX_NUM_CHECKS][MAX_CHECK_SIZE][SMT_LEVEL + 1]; // [fValue, siblings...]
  signal input credentialsFieldIndex[MAX_NUM_CHECKS][MAX_CHECK_SIZE]; // fKey
  signal input credentialsValue[MAX_NUM_CHECKS][MAX_CHECK_SIZE][MAX_VALUE_CHUNK]; // [raw data]
  // schema checks
  signal input schemaChecksProof[MAX_NUM_CHECKS][MAX_CHECK_SIZE][SMT_LEVEL + 1]; // [fKey, fValue, siblings...]
  signal input schemaChecksFieldIndex[MAX_NUM_CHECKS][MAX_CHECK_SIZE]; // fKey
  signal input schemaChecksValue[MAX_NUM_CHECKS][MAX_CHECK_SIZE][MAX_VALUE_CHUNK]; // [raw data]
  signal input schemaChecksOperation[MAX_NUM_CHECKS][MAX_CHECK_SIZE]; //

  // empty key-value pair will be marked as zero
  signal output out; // result = true/false
  
  // validation

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

component main {public [credentialRoots, schemaCheckRoots, credentialsFieldIndex, schemaChecksFieldIndex, schemaChecksOperation ]} = VCVerifier(1, 6, 4, 6);