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

const countBingos = card => {
    let res = 0;
    // rows
    card.map(row => {
        if (row.sum() === 0) res++;
    })
    // cols
    card[0].map((_, x) => {
        if (card.map(row => row[x]).sum() === 0) res++;
    })

    let d1 = 0, d2 = 0;
    for (let i = 0; i < 5; i++) {
        d1 += card[i][i];
        d2 += card[4-i][i];
    }
    if (d1 === 0) res++;
    if (d2 === 0) res++;
    return res;
}

const parse = input => {
    let [calledLit, cardsLit] = input.split('\n\n');
    return [calledLit.split('\n').join(' ').split(' ').map(Number), cardsLit.split('\n').join(' ').split(' ').map(Number).chunk(25).map(c => c.chunk(5))]
}

const run = ([hits, cards]) => {

    const turn = nr => cards = cards.map(card => {
        card = card.map(row => row.map(v => v == nr ? 0 : v))
        return card;
    })

    let res = false;

    for (let h = 0; h < hits.length; h++) {
        let nr = hits[h];
        turn(nr);

        let bingos = cards.map(card => countBingos(card)).sum();
        if (bingos >= 5) {
            res = nr;
            break;
        }
    }
    return res;
}

console.log('p1', run(parse(input)))
