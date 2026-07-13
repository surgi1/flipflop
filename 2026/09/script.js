const parse = input => input.split('\n').map(line => line.split(' ').join(''))

Object.defineProperty(Array.prototype, 'sum', {
    value: function() {
        return this.reduce((a, v) => a+v, 0);
    }
});

const solve = (data, passes = 7) => {
    let stoats = {
        A: 1,
        B: 1
    }
    for (let pass = 0; pass < passes; pass++) {
        let newStoats = {};
        Object.entries(stoats).forEach(([from, mult]) => {
            // get the first
            let rule = data.filter(v => v[0] === from)[0];
            for (let i = 1; i < rule.length; i++) {
                if (newStoats[rule[i]] === undefined) newStoats[rule[i]] = 0;
                newStoats[rule[i]] += mult
            }
        })
        stoats = newStoats;
    }
    return Object.values(stoats).sum();
}

const solve2BF = (data, passes = 7) => {
    let ruleCache = {};

    let stoats = 'AB';
    for (let pass = 0; pass < passes; pass++) {
        let newStoats = stoats[0], len = stoats.length;
        for (let i = 1; i < len; i++) {
            // find the rule for either stoats[i-1], stoats[i] or stoats[i], stoats[i-1]
            let k = stoats[i-1] + stoats[i];
            if (ruleCache[k] === undefined) {
                let rules = data.filter(v => (v[0] === from[0] && v[1] === from[1]) || (v[0] === from[1] && v[1] === from[0]) );
                ruleCache[k] = rules[0].slice(2);
            }
            newStoats += ruleCache[k] + stoats[i];
        }
        stoats = newStoats;
    }
    return stoats.length;
}

const solve2 = (data, passes = 7) => {
    let ruleCache = {};

    let stoats = {
        AB: 1
    }
    for (let pass = 0; pass < passes; pass++) {
        let newStoats = {};
        Object.entries(stoats).forEach(([from, mult]) => {
            let k = from[0] + from[1];
            if (ruleCache[k] === undefined) {
                let rules = data.filter(v => (v[0] === from[0] && v[1] === from[1]) || (v[0] === from[1] && v[1] === from[0]) );
                ruleCache[k] = rules[0].slice(2);
            }

            let res = from[0] + ruleCache[k] + from[1]; // split back into pairs
            for (let i = 1; i < res.length; i++) {
                let np = res[i-1] + res[i];
                if (newStoats[np] === undefined) newStoats[np] = 0;
                newStoats[np] += mult;
            }
        })
        stoats = newStoats;
    }
    return Object.values(stoats).sum() + 1; // ummm no idea why +1, but well...
}

console.log('p1', solve(parse(input)));
console.log('p2', solve2(parse(input)));
//console.log('p3', solve2BF(parse(inputt), 21));
console.log('p3', solve2(parse(input), 21));
