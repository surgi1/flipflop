// for p2 see script.p1.js
// for proper p3 see script.p3.js

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

const countBingos2d = (card, div = 2) => {
    let res = 0;

    // rows
    card.map(row => {
        if (row.sum() === 0) res++;
    })

    // cols
    card[0].map((_, x) => {
        if (card.map(row => row[x]).sum() === 0) res++;
    })

    res = res / div;

    let d1 = 0, d2 = 0;
    for (let i = 0; i < 5; i++) {
        d1 += card[i][i];
        d2 += card[4-i][i];
    }
    if (d1 === 0) res++;
    if (d2 === 0) res++;
    return res;
}

const cubeIntoSlices = card => {
    let slices = [];

    // xform into slices (2d cards) by each axis
    for (let i = 0; i < 5; i++) {
        let slice1 = [];
        let slice2 = [];
        let slice3 = [];
        for (let j = 0; j < 5; j++) {
            slice1[j] = [];
            slice2[j] = [];
            slice3[j] = [];
            for (let k = 0; k < 5; k++) {
                slice1[j][k] = card[i][j][k];
                slice2[j][k] = card[j][k][i];
                slice3[j][k] = card[k][i][j];
            }
        }
        slices.push(slice1, slice2, slice3);
    }

    return slices;
}

const countBingos3d = (card, div) => {
    let res = 0;

    let slices = cubeIntoSlices(card);
    res = Math.round(slices.map(slice => countBingos2d(slice, div)).sum()); // the twist: each non-diagonal line is processed counted twice for 3d cube

    // 3d diagonals are left now
    let d1 = 0, d2 = 0, d3 = 0, d4 = 0;
    for (let i = 0; i < 5; i++) {
        d1 += card[i][i][i];
        d2 += card[4-i][i][i];
        d3 += card[i][4-i][i];
        d4 += card[4-i][4-i][i];
    }
    if (d1 === 0) res++;
    if (d2 === 0) res++;
    if (d3 === 0) res++;
    if (d4 === 0) res++;
    return res;
}

const parse = input => {
    let [calledLit, cardsLit] = input.split('\n\n');
    return [calledLit.split('\n').join(' ').split(' ').map(Number), cardsLit.split('\n').join(' ').split(' ').map(Number).chunk(5*5*5).map(c => c.chunk(5*5).map(h => h.chunk(5) ) )]
}

const run = ([hits, cards], div = 2) => {
    const turn = nr => cards = cards.map(card => {
        card = card.map(slice => slice.map( row => row.map(v => v == nr ? 0 : v) ) )
        return card;
    })

    let res = false;
    for (let h = 0; h < hits.length; h++) {
        let nr = hits[h];
        turn(nr);

        let bingos = cards.map(card => countBingos3d(card, div)).sum();
        if (bingos >= 5) {
            res = nr;
            break;
        }

    }
    return res;
}

console.log('p2', run(parse(input)))
console.log('p3 tricked', run(parse(input), 1)) // removing the div accidentally hit the answer for p3, tbd verify if thats generic enough (likely not)
// see script.p3.js for proper solution
