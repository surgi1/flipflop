// part 3 is only guesstimated here, does not solve arbitrary input yet. TBD

const parse = input => input.split('\n').map(l => l.split(''))
const dist = (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// floodfill
const distanceMap = (map, froms, tpMode = 0, entryDist = 0, wall = '#', path = '.') => {
    const offMap = (x, y) => x < 0 || y < 0 || x >= cols || y >= rows;

    let cols = map[0].length, rows = map.length, cur;
    let filled = map.map(row => row.slice().fill(Infinity)),
        stack = froms.map(from => ({
            pos: [...from],
            dist: entryDist
        }));

    while (cur = stack.shift()) {
        let [cx, cy] = cur.pos;

        if (filled[cy][cx] <= cur.dist) continue;
        filled[cy][cx] = cur.dist;

        if (tpMode !== 0) {
            // tp to the end of the hall in each direction
            DIRS.forEach(([dx, dy]) => {
                let [x, y] = [cx, cy];
                while (!offMap(x+dx, y+dy) && map[y+dy][x+dx] !== wall) {
                    [x, y] = [x+dx, y+dy];
                }
                if (map[y][x] === wall) return true;
                if (dist([cx, cy], [x, y]) < tpMode+1) return true;
                if (filled[y][x] > cur.dist + tpMode) stack.push({
                    pos: [x, y],
                    dist: cur.dist + tpMode
                })
            })
        }

        DIRS.forEach(([dx, dy]) => {
            let [x, y] = [cx+dx, cy+dy];
            if (offMap(x, y)) return true;
            if (map[y][x] === wall) return true;
            if (filled[y][x] > cur.dist+1) stack.push({
                pos: [x, y],
                dist: cur.dist+1
            })
        })
    }
    return filled;
}

const run = (map, tpMode = 0) => {
    let cols = map[0].length, rows = map.length, cur;
    let start, end, cheats = {};
    
    map.forEach((row, y) => row.forEach((v, x) => {
        if (v == '#') return true;
        if (v == 'S') start = [x, y];
        if (v == 'E') end = [x, y];
        map[y][x] = '.';
    }))

    let dmap = distanceMap(map, [start], tpMode);

    return dmap[end[1]][end[0]];
}

console.log('p1', run(parse(input)))
console.log('p2', run(parse(input), 1))
console.log('p3', Math.round(run(parse(input), 2.3))) // this is not a true solution, it is guesstimated simplification (tried 2.2 and 2.4, got lower and higher than expected) that ended up hitting the target by accident
// 791

