CIRCUIT_PATH=circuits/v2
CIRCUIT_NAME:=vc_schema_field_check_verifier
ARTIFACTS_PATH = $(CIRCUIT_PATH)/artifacts
CIRCUIT_ENTRY_PATH=$(CIRCUIT_PATH)/$(CIRCUIT_NAME).circom
###########
CRS_PATH = circuits/powersOfTau28_hez_final_16.ptau
INPUT_PATH = $(CIRCUIT_PATH)/$(CIRCUIT_NAME)_input.json
########### generated artifacts' paths
PROOF_PATH = $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_proof.json
PUBLIC_INPUT_PATH = $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_public.json
VERIFICATION_KEY_PATH = $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_verification_key.json
CIRCUIT_FINAL_ZKEY = $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_circuit_final.zkey
WITNESS_PATH = $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_witness.wtns
VERIFIER_CONTRACT_PATH = $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_verifier.sol
all: $(CIRCUIT_NAME)

compile: $(CIRCUIT_ENTRY_PATH)
	rm -rf $(ARTIFACTS_PATH)
	mkdir $(ARTIFACTS_PATH)
	circom $(CIRCUIT_ENTRY_PATH) --r1cs --wasm -o $(ARTIFACTS_PATH)

$(CIRCUIT_NAME): compile setup generate_verification_key generate_witness_wasm prove verify

generate_witness_wasm:
	node $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_js/generate_witness.js $(ARTIFACTS_PATH)/$(CIRCUIT_NAME)_js/$(CIRCUIT_NAME).wasm $(INPUT_PATH) $(WITNESS_PATH)

setup:
	snarkjs groth16 setup $(ARTIFACTS_PATH)/$(CIRCUIT_NAME).r1cs $(CRS_PATH) $(CIRCUIT_FINAL_ZKEY)

generate_verification_key:
	snarkjs zkey export verificationkey $(CIRCUIT_FINAL_ZKEY) $(VERIFICATION_KEY_PATH)

prove:
	snarkjs groth16 prove $(CIRCUIT_FINAL_ZKEY) $(WITNESS_PATH) $(PROOF_PATH) $(PUBLIC_INPUT_PATH)

verify:
	snarkjs groth16 verify $(VERIFICATION_KEY_PATH) $(PUBLIC_INPUT_PATH) $(PROOF_PATH)

generate_contract:
	snarkjs zkey export solidityverifier $(CIRCUIT_FINAL_ZKEY) $(VERIFIER_CONTRACT_PATH)
	
simulate_contract_call:
	snarkjs zkey export soliditycalldata $(PUBLIC_INPUT_PATH) $(PROOF_PATH)

generate_contract_call:
	cd $(ARTIFACTS_PATH) && snarkjs generatecall 
	
clean:
	rm -rf $(ARTIFACTS_PATH)


# CIRCUIT_NAME=mult
# CIRCUIT_ENTRY_PATH=$(CIRCUIT_NAME).circom
# FINAL_PTAU_PATH = powersOfTau28_hez_final_10.ptau

# all: $(CIRCUIT_NAME)

# $(CIRCUIT_NAME): step_1_compile step_2_powers_of_tau step_3_circuit_specific_setup step_4_prover_generates_proof step_5_verifiers_verifies_proof step_6_generate_contract step_7_generate_contract_call

# step_1_compile: $(CIRCUIT_ENTRY_PATH)
# 	circom $(CIRCUIT_ENTRY_PATH) --r1cs --wasm --sym

# step_2_powers_of_tau:	
# 	# do nothing, just copy from https://github.com/iden3/snarkjs

# step_3_circuit_specific_setup:
# 	snarkjs r1cs info $(CIRCUIT_NAME).r1cs # Print circuit information
# 	snarkjs r1cs print $(CIRCUIT_NAME).r1cs $(CIRCUIT_NAME).sym # Print constaints
# 	snarkjs groth16 setup $(CIRCUIT_NAME).r1cs $(FINAL_PTAU_PATH) $(CIRCUIT_NAME).zkey # generate zkey (proving key, verification key)
# 	snarkjs zkey export verificationkey $(CIRCUIT_NAME).zkey verification_key.json  # export verification keys to json

# step_4_prover_generates_proof:
# 	(cd $(CIRCUIT_NAME)_js && node generate_witness.js $(CIRCUIT_NAME).wasm ../input.json ../witness.wtns) # Calculate witness
# 	snarkjs groth16 prove $(CIRCUIT_NAME).zkey witness.wtns proof.json public.json # generate proof from witness

# step_5_verifiers_verifies_proof:
# 	snarkjs groth16 verify verification_key.json public.json proof.json

# step_6_generate_contract:
# 	snarkjs zkey export solidityverifier $(CIRCUIT_NAME).zkey verifier.sol

# step_7_generate_contract_call:
# 	snarkjs generatecall

# clean:
# 	rm -rf witness.wtns verification_key.json public.json proof.json verifier.sol $(CIRCUIT_NAME).zkey $(CIRCUIT_NAME)_js $(CIRCUIT_NAME).sym $(CIRCUIT_NAME).r1cs