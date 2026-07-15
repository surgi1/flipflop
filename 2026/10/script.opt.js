
const UINT16_MASK = 0xffff;
const INSTRUCTION_LIMIT = 5_000_000;

/**
 * Returns true when the program would execute more than 5,000,000
 * original meta-language instructions.
 */
function isInfinite(startR0, startR1) {
    let r0 = startR0 & UINT16_MASK;
    let r1 = startR1 & UINT16_MASK;

    let r2 = 23;
    let r3 = 43;
    let r4 = 32;
    let r5 = 39;
    let r6 = 2;
    let r7 = 24;
    let r10 = 0;
    let r15 = 16;

    // The seven initialization instructions have already executed.
    let remaining = INSTRUCTION_LIMIT - 7;
    let pc = 0;

    for (;;) {
        switch (pc) {
            case 0: // L0: 6 instructions
                if ((remaining -= 6) < 0) return true;

                r1 = (r1 + r2) & UINT16_MASK;
                r3 = (r3 + 1) & UINT16_MASK;

                // Equivalent to the two original r0 operations.
                r0 = (r0 + r3 - r4) & UINT16_MASK;
                r0 = r15 === 0 ? 0 : r0 % r15;

                pc = r0 !== 0 ? 5 : 1;
                break;

            case 1: { // L1: 6 instructions
                if ((remaining -= 6) < 0) return true;

                r1 = (r1 + r3) & UINT16_MASK;

                // r12 is only a temporary register.
                const squared = (r1 * r1) & UINT16_MASK;
                r3 = (r3 + squared + r4) & UINT16_MASK;

                pc = r3 !== 0 ? 9 : 2;
                break;
            }

            case 2: // L2: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r7 = r3;
                r7 = r15 === 0 ? 0 : r7 % r15;

                pc = r7 === 0 ? 4 : 3;
                break;

            case 3: { // L3: 6 instructions
                if ((remaining -= 6) < 0) return true;

                // r8 and r9 are only temporary registers.
                const squared = (r3 * r3) & UINT16_MASK;
                const value = (squared + r4) & UINT16_MASK;

                r10 = r15 === 0 ? 0 : value % r15;
                r0 = (r0 - r10) & UINT16_MASK;

                pc = r0 !== 0 ? 20 : 4;
                break;
            }

            case 4: { // L4: 5 instructions
                if ((remaining -= 5) < 0) return true;

                // r11 is only a temporary register.
                const squared = (r7 * r7) & UINT16_MASK;
                r3 = (squared + r4 + r2) & UINT16_MASK;

                pc = squared !== 0 ? 8 : 5;
                break;
            }

            case 5: // L5: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r0 = (r0 + r15 - r2) & UINT16_MASK;
                pc = r2 !== 0 ? 1 : 6;
                break;

            case 6: // L6: 2 instructions
                if ((remaining -= 2) < 0) return true;

                r2 = r0 === 0 ? 0 : r2 % r0;
                pc = r4 !== 0 ? 19 : 7;
                break;

            case 7: // L7: either 3 or 4 instructions
                r6 = (r6 - r0) & UINT16_MASK;
                r4 = (r4 - r2) & UINT16_MASK;

                if (r6 === 0) {
                    // Lines 046, 047 and 048.
                    if ((remaining -= 3) < 0) return true;

                    pc = 6;
                } else {
                    // Lines 046-049, including the unconditional JMP.
                    if ((remaining -= 4) < 0) return true;

                    pc = 9;
                }
                break;

            case 8: // L8: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r4 = (r4 + 1) & UINT16_MASK;
                r15 = (r15 - 1) & UINT16_MASK;

                pc = r15 !== 0 ? 7 : 9;
                break;

            case 9: // L9: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r0 = (r0 + r4 - r3) & UINT16_MASK;
                pc = r0 === 0 ? 15 : 10;
                break;

            case 10: { // L10: 7 instructions
                if ((remaining -= 7) < 0) return true;

                const squared = (r1 * r1) & UINT16_MASK;

                /*
                 * Original:
                 *
                 * r15 = r1²
                 * r15 = r15 + oldR2
                 * r2 = r10 - oldR2
                 * r2 = r15 + r2
                 *
                 * The old r2 values cancel modulo 65536, leaving:
                 *
                 * r2 = r1² + r10
                 */
                r15 = (squared + r2) & UINT16_MASK;
                r2 = (squared + r10) & UINT16_MASK;

                r15 = r4 === 0 ? 0 : r15 % r4;
                pc = r15 !== 0 ? 18 : 11;
                break;
            }

            case 11: // L11: 5 instructions
                if ((remaining -= 5) < 0) return true;

                r5 = ((r3 * r3) + r2) & UINT16_MASK;
                r5 = r4 === 0 ? 0 : r5 % r4;

                pc = r5 !== 0 ? 3 : 12;
                break;

            case 12: // L12: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r0 = (r0 + r15 - r5) & UINT16_MASK;
                pc = 21;
                break;

            case 13: // L13: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r2 = (r2 + r4) & UINT16_MASK;
                r3 = (r3 - r15) & UINT16_MASK;

                pc = r2 !== 0 ? 10 : 14;
                break;

            case 14: // L14: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r4 = (r4 + r5) & UINT16_MASK;
                r1 = (r1 - r2) & UINT16_MASK;

                pc = r4 !== 0 ? 11 : 15;
                break;

            case 15: // L15: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r2 = (r2 + r3) & UINT16_MASK;
                r15 = (r15 - r4) & UINT16_MASK;

                pc = r2 !== 0 ? 12 : 16;
                break;

            case 16: // L16: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r4 = (r4 + r0) & UINT16_MASK;
                r5 = (r5 - r15) & UINT16_MASK;

                pc = r4 === 0 ? 13 : 17;
                break;

            case 17: // L17: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r15 = (r15 + r1) & UINT16_MASK;
                r3 = (r3 - r5) & UINT16_MASK;

                pc = r15 !== 0 ? 14 : 18;
                break;

            case 18: // L18: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r5 = (r5 + r2) & UINT16_MASK;
                r0 = (r0 - r3) & UINT16_MASK;

                pc = r5 !== 0 ? 16 : 19;
                break;

            case 19: // L19: 3 instructions
                if ((remaining -= 3) < 0) return true;

                r3 = (r3 + r4) & UINT16_MASK;
                r2 = (r2 - r0) & UINT16_MASK;

                pc = r3 !== 0 ? 17 : 20;
                break;

            case 20: { // L20: 4 instructions
                if ((remaining -= 4) < 0) return true;

                const r13 = (r0 - r5) & UINT16_MASK;
                const r14 = r2 === 0 ? 0 : r13 % r2;

                r0 = (r0 + r14) & UINT16_MASK;
                pc = r0 === 0 ? 0 : 21;
                break;
            }

            case 21: { // L21: 7 instructions
                if ((remaining -= 7) < 0) return true;

                const firstR13 = (r15 - r3) & UINT16_MASK;
                const r14 = r4 === 0 ? 0 : firstR13 % r4;

                r2 = (r2 + r14) & UINT16_MASK;
                r0 = (r0 + r14) & UINT16_MASK;

                const finalR13 = (r1 - r2) & UINT16_MASK;

                /*
                 * The assignment on line 115 still counts as an instruction,
                 * but its resulting r14 value is never subsequently read.
                 * Therefore, the actual modulo operation can be omitted.
                 */

                if (finalR13 !== 0) {
                    pc = 2;
                } else {
                    return false;
                }

                break;
            }

            default:
                throw new Error(`Invalid program counter: ${pc}`);
        }
    }
}

const run2x = (r0max = 99, r1 = 0) => {
    let loops = 0;
    for (let r0 = 0; r0 <= r0max; r0++) {
        if (isInfinite(r0, r1)) loops++;
    }
    return loops;
}

const scanAll = () => {
    let res = 0;
    for (let r1 = 0; r1 <= 15; r1++) {
        let partRes = run2x(65535, r1);
        console.log(r1, partRes)
        res += partRes;
    }
    return res;
}

console.time('p3opt');
console.log(scanAll())
console.timeEnd('p3opt');