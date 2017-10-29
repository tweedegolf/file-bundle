// @flow
type MixedArray1Type = (?string)[];
type MixedArray2Type = (null | string)[];
type MixedArray3Type = string[];

const a1: MixedArray1Type = ['asdad', null, 'asdadad'];
const a2: MixedArray2Type = ['asdad', null, 'asdadad'];
const a3: MixedArray3Type = ['asdad', null, 'asdadad'];
