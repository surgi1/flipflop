const parse = input => input.split('\n').map(line => line.split(''))

const isInnerPt = (map, [x, y]) => x > 0 && y > 0 && x < map[0].length-1 && y < map.length-1

const change1dir = (map, maxIturns = 0) => {
    let innerPts = getPath(map, maxIturns).filter(([x, y]) => isInnerPt(map, [x, y]));
    let max = 0;

    innerPts.forEach(([x, y]) => {
        ['>', '<', '^', 'v'].forEach(dir => {
            if (dir !== map[y][x]) {
                let orig = map[y][x];
                map[y][x] = dir;
                max = Math.max(max, getPath(map, maxIturns).length)
                map[y][x] = orig;
            }
        })
    })
    return max;
}

const getPath = (map, maxIturns = 3) => {
    let seen = {}, pos = [0,0], iturns = 0;

    while (true) {
        let k = pos.join('_');
        let v = map[pos[1]][pos[0]];

        if (seen[k] !== undefined) {
            if (isInnerPt(map, pos)) {
                if (iturns < maxIturns) {
                    switch (v) {
                        case '^': v = '>'; break;
                        case '>': v = 'v'; break;
                        case 'v': v = '<'; break;
                        case '<': v = '^'; break;
                    }
                    iturns++;
                } else {
                    //console.log('about to make 4th iturn, breaking');
                    break;
                }
            } else {
                //console.log('2nd stop at edge pt, breaking');
                break;
            }
        } 

        seen[k] = pos.slice();

        switch (v) {
            case '<': pos[0]--; break;
            case '>': pos[0]++; break;
            case '^': pos[1]--; break;
            case 'v': pos[1]++; break;
        }
        if (map[pos[1]] === undefined || map[pos[1]][pos[0]] === undefined) {
            console.log('out of bounds, stopping');
            break;
        }
    }

    return Object.values(seen)
}

console.log('p1', getPath(parse(input), 0).length);
console.log('p2', change1dir(parse(input), 0));
console.log('p3', change1dir(parse(input), 3));
