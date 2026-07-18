// proper any-dimension solution

Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        let res = [];
        for (let i = 0; i < this.length; i += chunkSize) res.push(this.slice(i, i + chunkSize));
        return res;
    }
});

const parse = input => input.split('\n\n').map(section => section.split('\n').join(' ').split(' ').map(Number))
const vectInside = (vect) => vect.every((v, i) => i === 0 || (v >= 0 && v < 5));
const addVect = (a, b) => a.map((v, i) => v + b[i]);
const mulVect = (a, n) => a.map((v, i) => n * v);

const run = ([hits, cards1d], dim = 2) => {
    const turn = nr => cards = cards.map(card => {
        card = card.map(slice => slice.map( row => row.map(v => v == nr ? 0 : v) ) )
        return card;
    })

    // next I need generic-dimensional walk thru the cards array while keeping used coords that will later serve as pointers in the multi-dimensional card(s) array
    // purpose is to get coords of just marked number
    const getHitCoords = (nr) => {
        let hitCoords = false;

        const recur = (coords, tmp) => {
            if (hitCoords !== false) return;
            if (Array.isArray(tmp)) {
                tmp.forEach((v, i) => {
                    recur([...coords, i], v);
                })
            } else {
                if (tmp === nr) hitCoords = coords;
            }
        }

        recur([], cards);

        return hitCoords;
    }

    const setVal = (coords, val, coordId = 0, tmp = cards) => {
        //if (Array.isArray(tmp[ coords[coordId] ])) {
        if (coordId < coords.length-1) {
            setVal(coords, val, coordId+1, tmp[ coords[coordId] ]);
        } else {
            tmp[ coords[coordId] ] = val;
        }
    }

    const getVal = (coords, coordId = 0, tmp = cards) => {
        //if (Array.isArray(tmp[ coords[coordId] ])) {
        if (coordId < coords.length-1) {
            return getVal(coords, coordId+1, tmp[ coords[coordId] ]);
        } else {
            return tmp[ coords[coordId] ];
        }
    }

    let cards = cards1d.slice(0);
    for (let d = 0; d < dim; d++) cards = cards.chunk(5);
    //console.log(cards);

    // construct valid directional vectors
    let DIRS = [];

    const createDirRecur = (tmp, dim) => {
        //console.log('createDirRecur called', tmp, dim)
        if (dim === 0) return DIRS.push(tmp);
        [-1, 0, 1].forEach(v => createDirRecur([...tmp, v], dim-1));
    }

    createDirRecur([], dim);
    DIRS = DIRS.filter(vect => vect.some(v => v !== 0));

    let res = false, totalBingos = 0;

    for (let nr of hits) {
        let coords = getHitCoords(nr);
        //console.log('hit coords for', nr, coords);
        // now we have the coords of a hit
        if (coords === false) return true;
        // let's mark it
        setVal(coords, -1);

        // now, for each directional vector (from DIRS), let's get to the edge of the object (needs to account correctly for dimension param)
        // and then move forward 5 times and count values
        // important: DIRs need to have a leading 0 added to them to account for whole cards array
        let bingos = 0;

        for (const vect of DIRS) {
            let fullVect = [0, ...vect]; // including indexing the card

            let fullVectBW = mulVect(fullVect, -1);

            let tmpCoords = coords.slice(0);

            while (vectInside( addVect(tmpCoords, fullVectBW) )) {
                tmpCoords = addVect(tmpCoords, fullVectBW);
            }

            //console.log('processing direction', vect, '; search will be starting from coords', tmpCoords);

            let marked = 0;
            
            while (vectInside( addVect(tmpCoords, fullVect) )) {
                if (getVal(tmpCoords) === -1) marked++;
                tmpCoords = addVect(tmpCoords, fullVect);
            }
            if (getVal(tmpCoords) === -1) marked++; // remaining one

            if (marked === 5) bingos++;
        }

        totalBingos += Math.floor(bingos / 2); // each direction was processed twice

        if (totalBingos >= 5) {
            res = nr;
            break;
        }
    }
    
    return res;
}

console.log('p1', run(parse(input), 2))
console.log('p2', run(parse(input), 3))
console.log('p3', run(parse(input), 4))