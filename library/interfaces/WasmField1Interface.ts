export interface WasmField1Interface {
  // ref: https://github.com/iden3/ffjavascript/blob/master/src/wasm_field1.js
  op2(opName: string, a: Uint8Array, b: Uint8Array): Uint8Array;
  op2Bool(opName: string, a: Uint8Array, b: Uint8Array): boolean;
  op1(opName: string, a: Uint8Array): Uint8Array;
  op1Bool(opName: string, a: Uint8Array): boolean;
  add(a: Uint8Array, b: Uint8Array): Uint8Array;
  eq(a: Uint8Array, b: Uint8Array): boolean;
  isZero(a: Uint8Array): boolean;
  sub(a: Uint8Array, b: Uint8Array): Uint8Array;
  neg(a: Uint8Array): Uint8Array;
  inv(a: Uint8Array): Uint8Array;
  toMontgomery(a: Uint8Array): Uint8Array;
  fromMontgomery(a: Uint8Array): Uint8Array;
  mul(a: Uint8Array, b: Uint8Array): Uint8Array;
  div(a: Uint8Array, b: Uint8Array): Uint8Array;
  square(a: Uint8Array): Uint8Array;
  isSquare(a: Uint8Array): boolean;
  sqrt(a: Uint8Array): Uint8Array;
  exp(a: Uint8Array, b: Uint8Array | number): Uint8Array;
  isNegative(a: Uint8Array): boolean;
  e(a: Uint8Array | number, b?: Uint8Array | number): Uint8Array;
  toString(a: Uint8Array, radix?: number): string;
  fromRng(rng: any): Uint8Array;
  random(): Uint8Array;
  toObject(a: Uint8Array): any;
  fromObject(a: any): Uint8Array;
  toRprLE(buff: Uint8Array, offset: number, a: Uint8Array): void;
  toRprBE(buff: Uint8Array, offset: number, a: Uint8Array): void;
  fromRprLE(buff: Uint8Array, offset?: number): Uint8Array;
  batchInverse(
    buffIn: Uint8Array[] | Uint8Array,
  ): Promise<Uint8Array[] | Uint8Array>;
}
