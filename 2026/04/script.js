const DIR = {
    RIGHT: 0,
    LEFT: 1
}

const parse = input => {
    let lines = input.split('\n').reverse();
    let leaves = [];
    lines.forEach((line, h) => {
        if (!line.includes('o')) return true;
        leaves.push({
            type: line.includes('-o') ? DIR.RIGHT : DIR.LEFT,
            height: h
        })
        
    })
    return leaves;
}

const solveP1 = (data, h = 400) => data.filter(l => l.height > h).length

const solveP2 = data => {
    let dir = data[0].type, res = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i].type !== dir) {
            res++;
            dir = data[i].type;
        }
    }
    return res;
}

const solveP3 = data => {
    const traverse = () => {
        let dir = data[0].type, lastPtr = 0;
        for (let i = 1; i < data.length; i++) {
            if (data[i].type !== dir) {
                data[lastPtr].broken = true;
                lastPtr = i;
                dir = data[i].type;
            }
        }
        data[lastPtr].broken = true;
    }

    let workers = 0;
    while (data.length > 0) {
        traverse();
        data = data.filter(l => l.broken !== true)
        workers++;
    }

    return workers;
}

console.log('p1', solveP1(parse(input)));
console.log('p2', solveP2(parse(input)));
console.log('p3', solveP3(parse(input)));