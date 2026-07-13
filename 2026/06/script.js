const parse = input => input.split('\n').map((line, y) => line.split('').map((v, x) => ({
    type: v,
    x: x, y: y,
    rot: 0 // -1 = CCW, 0, 1 CW
})))

const onMap = (map, [x, y]) => map[y] !== undefined && map[y][x] !== undefined;

const DIRS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
]

const T = {
    START: 'S',
    LIGHT: '*',
    GEAR: '#',
    GEAR_2: '3',
}

const mapVal = map => {
    let res = map.flat().filter(n => n.type === T.LIGHT && n.rot !== 0).map(n => n.rot === -1 ? '1' : '0').join('')
    return BigInt('0b'+res);
}

const solve = (map) => {
    let start = map.flat().filter(n => n.type === T.START)[0];

    const spread = (x, y, rot = -1) => {
        if (!onMap(map, [x, y])) return;
        if (map[y][x].rot !== 0) return;
        if (![T.START, T.LIGHT, T.GEAR].includes(map[y][x].type)) return;
        map[y][x].rot = rot;
        DIRS.forEach(([dx, dy]) => spread(x+dx, y+dy, -rot))
    }

    spread(start.x, start.y);

    return mapVal(map);
}

const isPrime = n => {
    let res = true;

    if (n <= 1) {
        res = false;
    } else {
        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) { res = false; break; }
        }
    }
    return res;
}

const reachedGears = (_map, startX, startY, startRot = -1) => {
    let map = structuredClone(_map);
    let res = 0;

    const spread = (x, y, rot = -1) => {
        if (!onMap(map, [x, y])) return;
        if (map[y][x].rot !== 0) return;
        
        if (![T.GEAR, T.GEAR_2].includes(map[y][x].type)) return;
        map[y][x].rot = rot;
        res++;

        DIRS.forEach(([dx, dy]) => spread(x+dx, y+dy, -rot));
    }

    DIRS.forEach(([dx, dy]) => spread(startX+dx, startY+dy, startRot));

    return res;
}

const solve2 = (map, primesCheck = false) => {
    let start = map.flat().filter(n => n.type === T.START)[0];

    const spread = (x, y, rot = -1) => {
        if (!onMap(map, [x, y])) return;
        if (map[y][x].rot !== 0) return;
        
        // deal with blue teeth
        if (map[y][x].type.match(/[a-z]/g) !== null) {
            let receiver = map.flat().filter(n => n.type === map[y][x].type.toUpperCase())[0];
            let stopPropagation = primesCheck ? isPrime(reachedGears(map, receiver.x, receiver.y, -rot)) : false;

            map[y][x].rot = rot;
            receiver.rot = -rot;

            if (!stopPropagation) DIRS.forEach(([dx, dy]) => spread(receiver.x+dx, receiver.y+dy, rot));
            return;
        }

        if (![T.START, T.LIGHT, T.GEAR, T.GEAR_2].includes(map[y][x].type)) return;
        map[y][x].rot = rot;

        DIRS.forEach(([dx, dy]) => spread(x+dx, y+dy, -rot))
    }

    spread(start.x, start.y);

    return mapVal(map);
}

console.log('p1', solve(parse(input)));
console.log('p2', solve2(parse(input)));
console.log('p3', solve2(parse(input), true));
