Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        let res = [];
        for (let i = 0; i < this.length; i += chunkSize) res.push(this.slice(i, i + chunkSize));
        return res;
    }
});

const MAX_AGE = 100;

const D = {
    DOWN: 0,
    RIGHT: 1,
    UP: 2,
    LEFT: 3
}

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

const P = {
    SPROUT: 0,
    STEM: 1,
}

const STATE = {
    ALIVE: 0,
    DEAD: 1,
}

const parseTreeRules = lit => {
    let [top, bottom] = lit.split('\n').map(l => l.match(/\S+/g))
    return top.map((topId, i) => {
        return {
            topId: topId,
            leftId: bottom[i*3],
            fromId: bottom[i*3+1],
            rightId: bottom[i*3+2],
        }
    })
}

const parse = input => input.split('\n\n').map((lit, id) => ({
    rules: parseTreeRules(lit),
    parts: [{
        type: P.SPROUT,
        id: '00',
        x: id*10,
        y: 1, // effective height
    }], // init
    age: 0,
    id: id,
    state: STATE.ALIVE,
}))

// Important: What happens if 2 sprouts of the same tree grow into the same location?
// The resulting sprout with the highest DNA id will take priority and grow into that location
// (not the sprouts it came from, it's about the sprout ids that try to appear there).

const grow = (tree, trees = []) => {
    if (tree.state !== STATE.ALIVE) return;

    const growSprout = (p, newId, dir) => {
        if (newId === 'XX') return;
        // check for existing stems, do not grow into stem
        let x = p.x + DIRS[dir][0],
            y = p.y + DIRS[dir][1];

        let blockages = tree.parts
                .filter(p => p.type === P.STEM)
                .filter(p => p.x === x && p.y === y);

        if (blockages.length === 0 && trees.length > 0) {
            let allParts = trees.filter(t => t.id !== tree.id).map(t => t.parts).flat();
            blockages = allParts
                //.filter(p => p.type === P.STEM)
                .filter(p => p.x === x && p.y === y);
        }

        if (blockages.length > 0) {
            //console.log('blockages for dir', DIRS[dir], blockages);
            return;
        }

        tree.parts.push({ id: newId, type: P.SPROUT, x: x, y: y })
    }

    // grow all thesprouts at once
    // then sanitize the tree, no 2 sprouts can grow into same spot
    let sprouts = tree.parts.filter(p => p.type === P.SPROUT);
    sprouts.forEach(p => {
        // find the rule for this id
        let rule = tree.rules.find(r => r.fromId === p.id);
        if (!rule) {
            console.log('couldnt find a rule for id', id, tree);
            return true;
        }
        //console.log('growing', p, rule)
        // insert new sprouts
        growSprout(p, rule.topId, D.UP);
        growSprout(p, rule.leftId, D.LEFT);
        growSprout(p, rule.rightId, D.RIGHT);
        p.turnIntoStem = true;
    })
    
    tree.parts.filter(p => p.turnIntoStem === true).forEach(p => {
        p.type = P.STEM;
        delete p.turnIntoStem;
    });

    // sanitize: no stems on the same spot
    let stems = tree.parts.filter(p => p.type === P.STEM);
    let sanitizedStems = [];

    /*stems.forEach(p => {
        let stemsAtSpot = sanitizedStems.findIndex(s => s.x === p.x && s.y === p.y);
        if (stemsAtSpot === -1) {
            sanitizedStems.push(p);
        } else {
            if (Number(sanitizedStems[stemsAtSpot].id) < Number(p.id)) sanitizedStems[stemsAtSpot].id = p.id;
        }
    })*/

    // sanitize: no sprouts at the stem spots
    sprouts = tree.parts.filter(p => p.type === P.SPROUT).filter(p => {
        let stemsAtSpot = stems.filter(stem => stem.x === p.x && stem.y === p.y);
        return stemsAtSpot.length === 0;
    })
    let sanitizedSprouts = [];
    sprouts.forEach(p => {
        let sproutAtSpot = sanitizedSprouts.findIndex(s => s.x === p.x && s.y === p.y);
        if (sproutAtSpot === -1) {
            sanitizedSprouts.push(p);
        } else {
            if (Number(sanitizedSprouts[sproutAtSpot].id) < Number(p.id)) sanitizedSprouts[sproutAtSpot].id = p.id;
        }
    })

    tree.parts = [...stems, ...sanitizedSprouts];

    tree.age++;

    if (tree.age >= MAX_AGE) tree.state = STATE.DEAD;

    // energy check
    /*if (tree.age >= 5) {
        let required = tree.parts.length * 3;
        stems = tree.parts.filter(p => p.type === P.STEM);
        let produced = stems.reduce((total, stem, i) => {
            let base = Math.min(10, stem.y);
            let stemsAbove = stems.filter(s => s.x === stem.x && s.y > stem.y).length;

            if (stemsAbove < 3 && trees.length > 0) {
                let allParts = trees.filter(t => t.id !== tree.id).map(t => t.parts).flat();
                stemsAbove += allParts
                    .filter(s => s.type === P.STEM)
                    .filter(s => s.x === stem.x && s.y > stem.y).length;
            }

            let mult = Math.max(0, 3 - stemsAbove);
            return total + base*mult;
        }, 0);

        //console.log('energy check at age', tree.age, 'required:', required, 'produced:', produced, 'mass:', tree.parts.length, tree);
        if (required > produced) tree.state = STATE.DEAD;
    }*/

    //console.log('tree aged');
}

const encheck = (tree, trees = []) => {
    if (tree.state !== STATE.ALIVE) return;

    // energy check
    if (tree.age >= 5) {
        let required = tree.parts.length * 3;
        stems = tree.parts.filter(p => p.type === P.STEM);
        let produced = stems.reduce((total, stem, i) => {
            let base = Math.min(10, stem.y);
            let stemsAbove = stems.filter(s => s.x === stem.x && s.y > stem.y).length;

            if (stemsAbove < 3 && trees.length > 0) {
                let allParts = trees.filter(t => t.id !== tree.id).map(t => t.parts).flat();
                stemsAbove += allParts
                    .filter(s => s.type === P.STEM)
                    .filter(s => s.x === stem.x && s.y > stem.y).length;
            }

            let mult = Math.max(0, 3 - stemsAbove);
            return total + base*mult;
        }, 0);

        //console.log('energy check at age', tree.age, 'required:', required, 'produced:', produced, 'mass:', tree.parts.length, tree);
        if (required > produced) tree.state = STATE.DEAD;
    }
}


let el = document.getElementById('root');
let zoom = 4;

const draw = (tree) => {
    let s = '';
    tree.parts.forEach(p => {
        let x = (p.x + 70)*zoom;
        let y = (70 - p.y)*zoom;
        s += '<div class="cell ' + (p.type === P.SPROUT ? 'sprout' : '') + '" style="top:' + y + 'px;left:' + x + 'px">&nbsp;</div>' + '\n';
    })
    el.innerHTML = s;
}

const drawAll = (trees) => {
    let s = '';
    trees.forEach(tree => {
        tree.parts.forEach(p => {
            let x = (p.x + 100)*zoom;
            let y = (90 - p.y)*zoom;
            s += '<div class="cell ' + (p.type === P.SPROUT ? 'sprout' : '') + '" style="top:' + y + 'px;left:' + x + 'px">&nbsp;</div>' + '\n';
        })
    })
    el.innerHTML = s;
}

const run = (trees, interference = false) => {
    while (trees.filter(t => t.state === STATE.ALIVE).length > 0) {
        trees.forEach(t => grow(t, interference ? trees : []));
        trees.forEach(t => encheck(t, interference ? trees : []));
    }

    //draw(trees[0]);
    drawAll(trees);
    //console.log(trees);
    return trees.reduce((a, t) => a + t.parts.length, 0);
}

const run3 = (trees, gens = 1) => {
    run(trees, true);
    // create new trees
    // add original tree id to the sprouts
    trees.forEach(t => t.parts.forEach(p => p.origTreeId = t.id));
    // get x coords of the sprouts
    let sprouts = trees.map(t => t.parts).flat().filter(p => p.type === P.SPROUT)
    let xCoords = [...new Set(sprouts.map(s => s.x))].sort((a, b) => a-b);
    let newTrees = [];
    xCoords.forEach(x => {
        // get all parts that have the same x coord
        let parts = sprouts.filter(s => s.x === x).sort((a, b) => b.y-a.y);
        let p = parts[0];
        newTrees.push({
            id: newTrees.length,
            rules: trees[p.origTreeId].rules,
            parts: [{
                type: P.SPROUT,
                id: '00',
                x: p.x,
                y: 1, // effective height
            }], // init
            age: 0,
            state: STATE.ALIVE,
        })
    })
    //console.log(newTrees);
    // and set sail
    if (gens > 0) return run3(newTrees, gens-1);
    return run(newTrees, true);
}

console.log('p1', run(parse(input)))
console.log('p2', run(parse(input), true))
console.log('p3', run3(parse(input)))
