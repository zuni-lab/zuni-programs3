pragma circom 2.0.0;

include "../../circuits/circomlib/smt/smtverifier.circom";
include "../../circuits/circomlib/comparators.circom";
// MAX_VALUE_CHUNK = num of field elements used to represent a value

template EqualComparator(MAX_VALUE_CHUNK) {
  signal input a[MAX_VALUE_CHUNK];
  signal input b[MAX_VALUE_CHUNK];
  signal output out;

  signal res[MAX_VALUE_CHUNK];

  component tmp[MAX_VALUE_CHUNK];

  for (var i = 0; i < MAX_VALUE_CHUNK; i++) {
    tmp[i] = IsEqual();// 248 bits
    tmp[i].in[0] <== a[i];
    tmp[i].in[1] <== b[i];

    if(i == 0){
      res[i] <== tmp[i].out;
    }else{
      res[i] <== AND()(res[i - 1], tmp[i].out);
    }
  }

  out <== res[MAX_VALUE_CHUNK - 1];
}

template LessThanComparator(MAX_VALUE_CHUNK) {
  signal input a[MAX_VALUE_CHUNK];
  signal input b[MAX_VALUE_CHUNK];
  signal output out;

  signal res[MAX_VALUE_CHUNK];
  signal prefixEq[MAX_VALUE_CHUNK];

  component tmpLess[MAX_VALUE_CHUNK];
  component tmpEqual[MAX_VALUE_CHUNK];

  signal tmpSignals[MAX_VALUE_CHUNK];

  for (var i = 0; i < MAX_VALUE_CHUNK; i++) {
    tmpLess[i] = LessThan(31 * 8);// 248 bits
    tmpEqual[i] = IsEqual();// 248 bits

    tmpLess[i].in[0] <== a[i];
    tmpLess[i].in[1] <== b[i];
    tmpEqual[i].in <== tmpLess[i].in;

    // res[i] <== (i == 0 ? tmpLess[i].out : (res[i - 1] | (prefixEq[i - 1] & tmpLess[i].out)));
    if(i == 0){
      res[i] <== tmpLess[i].out;
    }else{
      tmpSignals[i] <== AND()(prefixEq[i - 1], tmpLess[i].out);
      res[i] <== OR()(res[i - 1], tmpSignals[i]);
    }

    // prefixEq[i] <== (i == 0 ? tmpEqual[i].in : prefixEq[i - 1] | tmpEqual[i].out);
    if(i == 0){
      prefixEq[i] <== tmpEqual[i].out;
    }else{
      prefixEq[i] <== AND()(prefixEq[i - 1], tmpEqual[i].out);
    }
  }

  out <== res[MAX_VALUE_CHUNK - 1];
}

template GreaterThanComparator(MAX_VALUE_CHUNK) {
  signal input a[MAX_VALUE_CHUNK];
  signal input b[MAX_VALUE_CHUNK];
  signal output out;

  signal res[MAX_VALUE_CHUNK];
  signal prefixEq[MAX_VALUE_CHUNK];

  component tmpGreater[MAX_VALUE_CHUNK];
  component tmpEqual[MAX_VALUE_CHUNK];

  signal tmpSignals[MAX_VALUE_CHUNK];

  for (var i = 0; i < MAX_VALUE_CHUNK; i++) {
    tmpGreater[i] = GreaterThan(31 * 8);// 248 bits
    tmpEqual[i] = IsEqual();// 248 bits

    tmpGreater[i].in[0] <== a[i];
    tmpGreater[i].in[1] <== b[i];
    tmpEqual[i].in <== tmpGreater[i].in;

    // res[i] <== (i == 0 ? tmpGreater[i].out : (res[i - 1] | (prefixEq[i - 1] & tmpGreater[i].out)));
    if(i == 0){
      res[i] <== tmpGreater[i].out;
    }else{
      tmpSignals[i] <== AND()(prefixEq[i - 1], tmpGreater[i].out);
      res[i] <== OR()(res[i - 1], tmpSignals[i]);
    }

    // prefixEq[i] <== (i == 0 ? tmpEqual[i].in : prefixEq[i - 1] | tmpEqual[i].out);
    if(i == 0){
      prefixEq[i] <== tmpEqual[i].out;
    }else{
      prefixEq[i] <== AND()(prefixEq[i - 1], tmpEqual[i].out);
    }
  }

  out <== res[MAX_VALUE_CHUNK - 1];
}

template ChunkComparator(MAX_VALUE_CHUNK){
  signal input a[MAX_VALUE_CHUNK];
  signal input b[MAX_VALUE_CHUNK];
  signal input op;
  signal output out;

  // // validate op
  // _ <== GreaterEqThan(3)([op, 0]); // lowerbound
  // _ <== LessThan(3)([op, 7]); // upperbound

  /* Six simple comparision operators:
  0: eq
  1: neq
  2: lt
  3: gte
  4: gt
  5: lte
  */

  signal t[6];
  var x = EqualComparator(MAX_VALUE_CHUNK)(a, b);
  var y = IsEqual()([op, 0]);
  t[0] <== AND()(y, x);

  x = NOT()(x);
  y = IsEqual()([op, 1]);
  t[1] <== AND()(y, x);

  x = LessThanComparator(MAX_VALUE_CHUNK)(a, b);
  y = IsEqual()([op, 2]);
  t[2] <== AND()(y, x);

  x = NOT()(x);
  y = IsEqual()([op, 3]);
  t[3] <== AND()(y, x);

  x = GreaterThanComparator(MAX_VALUE_CHUNK)(a, b);
  y = IsEqual()([op, 4]);
  t[4] <== AND()(y, x);

  x = NOT()(x);
  y = IsEqual()([op, 5]);
  t[5] <== AND()(y, x);

  signal ORs[6];
  ORs[0] <== t[0];
  for(var i = 1; i < 6; i++){
    ORs[i] <== OR()(ORs[i - 1], t[i]);
  }  

  out <== ORs[5];
  out === 1;
}

template PolynomialHash(degree) {
  // Inputs
  signal input coef[degree + 1]; // Coefficients of the polynomial
  var base = 21888242871839275222246405745257275088548364400416034343698204186575808495616; // generator of Jubjub - 1
  // Output
  signal output out;

  // Compute polynomial hash
  var hash = 0;
  for(var i = degree; i >= 0; i--){
    hash = hash * base + coef[i];
  }
  out <== hash;
}

template ValueEncodingValidator(MAX_VALUE_CHUNK){
  signal input fValue;
  signal input rawValue[MAX_VALUE_CHUNK];

  signal hash;
  hash <== PolynomialHash(MAX_VALUE_CHUNK - 1)(rawValue);

  hash === fValue;
}

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

template VCFieldVerifier(MAX_VALUE_CHUNK, SMT_LEVEL){
  // SMT roots
  signal input credentialRoot;
  signal input schemaCheckRoot;
  // the credentials below must MATCH the schema checks
  signal input credentialFieldIndex;
  signal input credentialFieldProof[SMT_LEVEL + 1]; // [fValue, siblings...]
  signal input credentialFieldValue[MAX_VALUE_CHUNK]; // [raw data]
  // schema checks
  signal input schemaCheckFieldIndex;
  signal input schemaCheckFieldProof[SMT_LEVEL + 1]; // [fValue, siblings...]
  signal input schemaCheckFieldValue[MAX_VALUE_CHUNK]; // [raw data]
  signal input schemaCheckFieldOperation; //

  // empty key-value pair will be marked as zero
  signal output out; // result = true/false
  
  // validation
  var smtProof[SMT_LEVEL + 2];
  smtProof[0] = credentialFieldIndex;
  for(var k = 0; k < SMT_LEVEL + 1; k++){
    smtProof[k + 1] = credentialFieldProof[k];
  }

  SMTKeyValuePairsVerifier(MAX_VALUE_CHUNK, SMT_LEVEL)(
    credentialRoot,
    smtProof,
    credentialFieldValue
  );
  /////////////////////////////////////////////////////////////////////////////////////////////////
  smtProof[0] = schemaCheckFieldIndex;
  for(var k = 0; k < SMT_LEVEL + 1; k++){
    smtProof[k + 1] = schemaCheckFieldProof[k];
  }
  SMTKeyValuePairsVerifier(MAX_VALUE_CHUNK, SMT_LEVEL)(
    schemaCheckRoot,
    smtProof,
    schemaCheckFieldValue
  );

  component cmp;
  // each credential must satisfy the corresponding check
  cmp = ChunkComparator(MAX_VALUE_CHUNK);
  cmp.a <== credentialFieldValue;
  cmp.b <== schemaCheckFieldValue;
  cmp.op <== schemaCheckFieldOperation;

  cmp.out === 1;
}

component main {public [credentialRoot, schemaCheckRoot, credentialFieldIndex, schemaCheckFieldIndex, schemaCheckFieldOperation ]} = VCFieldVerifier(4, 6);