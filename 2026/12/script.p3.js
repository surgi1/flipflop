Object.defineProperty(Array.prototype, 'sum', {
    value: function() {
        return this.reduce((a, v) => a+v, 0);
    }
});

Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        let res = [];
        for (let i = 0; i < this.length; i += chunkSize) res.push(this.slice(i, i + chunkSize));
        return res;
    }
});

const DIRECTIONS_4D = [];

for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
            for (let dw = -1; dw <= 1; dw++) {
                if (dx === 0 && dy === 0 && dz === 0 && dw === 0) continue;
                DIRECTIONS_4D.push([dx, dy, dz, dw]);
            }
        }
    }
}

const isInsideCube4D = (x, y, z, w) => {
    return (
        x >= 0 && x < 5 &&
        y >= 0 && y < 5 &&
        z >= 0 && z < 5 &&
        w >= 0 && w < 5
    );
}

const countBingos = (cube, call) => {
    let position = null;

    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            for (let z = 0; z < 5; z++) {
                for (let w = 0; w < 5; w++) {
                    if (cube[x][y][z][w] === call) {
                        position = [x, y, z, w];
                    }
                }
            }
        }
    }

    if (position === null) return 0;

    const [x0, y0, z0, w0] = position;

    cube[x0][y0][z0][w0] = -1; // mark the nr

    let bingos = 0;

    for (const [dx, dy, dz, dw] of DIRECTIONS_4D) {
        let x = x0;
        let y = y0;
        let z = z0;
        let w = w0;

        // move backwards until leaving the cube to have starting pt
        while (true) {
            x -= dx;
            y -= dy;
            z -= dz;
            w -= dw;

            if (!isInsideCube4D(x, y, z, w)) break;
        }

        // move forward from the edge and count marked cells
        let marked = 0;

        while (true) {
            x += dx;
            y += dy;
            z += dz;
            w += dw;

            if (!isInsideCube4D(x, y, z, w)) break;

            if (cube[x][y][z][w] === -1) marked++;
        }

        if (marked == 5) bingos++;
    }

    // every line is checked from both directions
    return Math.floor(bingos / 2);
}

const solve = input => {
    const sections = input.split(/\n\n/);

    const callsLit = sections.shift();
    const cardsLit = sections.join("\n");

    const calls = callsLit.trim().split(/\s+/).map(Number);

    const lines = cardsLit.split("\n").map(line => line.trim());

    const cube = [];

    for (let i = 0; i < lines.length; i += 5) {
        const d3Slice = [];

        for (let j = 0; j < 5; j++) {
            const numbers = lines[i + j]
                .split(/\s+/)
                .map(Number);

            const batches = [];

            for (let k = 0; k < numbers.length; k += 5) {
                batches.push(numbers.slice(k, k + 5));
            }

            d3Slice.push(batches);
        }

        cube.push(d3Slice);
    }

    let bingos = 0;
    let answer = null;

    for (const call of calls) {
        bingos += countBingos(cube, call);
        answer = call;

        if (bingos >= 5) break;
    }

    return answer;
}

console.log('p3', solve(input));