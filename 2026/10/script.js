// generic optimistic brute-force solution for P3, runs in ~15 minutes while run in parallel
// see transpiled.meta for the meta code of the problem
// see script.opt.js for (non-generic) transcription
// TBD better generic solution

Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        let res = [];
        for (let i = 0; i < this.length; i += chunkSize) res.push(this.slice(i, i + chunkSize));
        return res;
    }
});

const mod = (n, m) => {
    if (m === 0) return 0;
    return n % m;
}

const MAX_TICKS = 5_000_000;

const EXIT_CODE = {
    DEFAULT: 0,
    INF_LOOP: 1,
}

const LTYPE = {
    LABEL: 0,
    INSTRUCTION: 1
}

const OP = {
    SET: 0, // Load immediate value into register. (val, dest_reg)
    CPY: 1, // Copy value from one register to another. (src_reg, dest_reg)
    ADD: 2, // Add values from two registers and store result in a third register. (src_reg1, src_reg2, dest_reg)
    SUB: 3, // Subtract values from two registers and store result in a third. (src_reg1, src_reg2, dest_reg)
    MUL: 4, // Multiply values from two registers and store result in a third. (src_reg1, src_reg2, dest_reg)
    MOD: 5, // Modulo values from two registers and store result in a third. (src_reg1, src_reg2, dest_reg)
    INC: 6, // Increment value in a register by 1. (reg)
    DEC: 7, // Decrement value in a register by 1. (reg)
    JMP: 8, // Jump to label. (label)
    JZ: 9, // Jump to label if value in register is zero. (reg, label)
    JNZ: 10, // Jump to label if value in register is not zero. (reg, label)
}

const parseLine = line => {
    let res = {};
    let tmp = line.split('').chunk(2).map(chunk => chunk.join(''))
    if (tmp[0] === 'be') {
        res.type = LTYPE.LABEL;
        res.value = tmp.length-1;
    } else {
        res.type = LTYPE.INSTRUCTION;
        let ptr = 1; counts = [], count = 0;
        while (ptr < tmp.length) {
            if (tmp[ptr] === 'na') count++;
            if (tmp[ptr] === 'ne') {
                counts.push(count);
                count = 0;
            }
            ptr++;
        }
        counts.push(count);
        res.op = counts.shift();
        res.params = counts;
    }

    return res;
}

// line is object with type: label/instruction, val for label, op (int) and params ([int]) for instructions
const parse = input => linesLit = input.split('\n').map(lineLit => parseLine(lineLit));

let jmpTargetCache = {}
const jmpTarget = (lines, v) => {
    if (jmpTargetCache[v] === undefined) jmpTargetCache[v] = lines.findIndex(line => line.type === LTYPE.LABEL && line.value === v) + 1;
    return jmpTargetCache[v];
}

const run = (lines, regs = new Uint16Array(16).fill(0)) => {
    let ptr = 0, ticks = 0, exitCode = EXIT_CODE.DEFAULT;
    while (ptr < lines.length) {
        if (ticks > MAX_TICKS) {
            exitCode = EXIT_CODE.INF_LOOP;
            break;
        }
        let line = lines[ptr], params = line.params;
        if (line.type === LTYPE.LABEL) {
            ptr++;
            continue;
        }

        switch (line.op) {
            case OP.SET: ticks++; regs[params[1]] = params[0]; ptr++; break;
            case OP.CPY: ticks++; regs[params[1]] = regs[params[0]]; ptr++; break;
            case OP.ADD: ticks++; regs[params[2]] = regs[params[0]] + regs[params[1]]; ptr++; break;
            case OP.SUB: ticks++; regs[params[2]] = regs[params[0]] - regs[params[1]]; ptr++; break;
            case OP.MUL: ticks++; regs[params[2]] = regs[params[0]] * regs[params[1]]; ptr++; break;
            case OP.MOD: ticks++; regs[params[2]] = mod(regs[params[0]], regs[params[1]]); ptr++; break;
            case OP.INC: ticks++; regs[params[0]] = regs[params[0]] + 1; ptr++; break;
            case OP.DEC: ticks++; regs[params[0]] = regs[params[0]] - 1; ptr++; break;
            case OP.JMP: ticks++; ptr = jmpTarget(lines, params[0]); break;
            case OP.JZ:  ticks++; if (regs[params[0]] === 0) ptr = jmpTarget(lines, params[1]); else ptr++; break;
            case OP.JNZ: ticks++; if (regs[params[0]] !== 0) ptr = jmpTarget(lines, params[1]); else ptr++; break;
            default: console.log('unsupported op', line);
        }
    }

    return {regs: regs, exitCode: exitCode};
}

const transpile = (lines) => {
    //console.log(lines);

    return lines.map(line => {
        if (line.type === LTYPE.LABEL) return '@L'+line.value + ':';
        let params = line.params;
        switch (line.op) {
            case OP.SET: return 'r' + params[1] + ' = ' + params[0];
            case OP.CPY: return 'r' + params[1] + ' = r' + params[0];
            case OP.ADD: return 'r' + params[2] + ' = r' + params[0] + ' + r' + params[1];
            case OP.SUB: return 'r' + params[2] + ' = r' + params[0] + ' - r' + params[1];
            case OP.MUL: return 'r' + params[2] + ' = r' + params[0] + ' * r' + params[1];
            case OP.MOD: return 'r' + params[2] + ' = r' + params[0] + ' % r' + params[1];
            case OP.INC: return 'r' + params[0] + '++';
            case OP.DEC: return 'r' + params[0] + '--';
            case OP.JMP: return 'JMP L' + params[0]
            case OP.JZ:  return 'if (r' + params[0] + ' === 0) JMP L' + params[1];
            case OP.JNZ: return 'if (r' + params[0] + ' !== 0) JMP L' + params[1];
            default: console.log('unsupported op', line);
        }


    }).map((line, i) => {
        return (i+'').padStart(3, '0') + '    ' + line;
    }).join('\n');
}

const run2 = (lines, r0max = 99, r1 = 0) => {
    let loops = 0;
    for (let r0 = 0; r0 <= r0max; r0++) {
        let regs = new Uint16Array(16).fill(0);
        regs[0] = r0;
        regs[1] = r1;
        let res = run(lines, regs);
        //console.log(r0, res.exitCode)
        if (res.exitCode === EXIT_CODE.INF_LOOP) loops++;
    }
    return loops;
}

console.log('p1', run(parse(input)))
console.log('p2', run2(parse(input)))
/*console.time('p3');
//console.log('p3', run2(parse(input), 65535, 15))
console.log('p3', run2(parse(input), 99, 0))
console.timeEnd('p3');
*/

//console.log(transpile(parse(input)));
/*
just run all of that in parallel or redesign to worker
r1
0: 12288
1: 0
2: 65536
3: 0
4: 57344
5: 4096
6: 61440
7: 4096
8: 61440
9: 8192
10: 4096
11: 0
12: 45056
13: 16384
14: 57344
15: 4096
*/