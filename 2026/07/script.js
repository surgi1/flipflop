const parse = input => {
    let [movesLit, foodLit] = input.split('\n\n');
    return [
        movesLit.split(''),
        foodLit.split('\n').map(line => line.split(',').map(Number))
    ]
}

const onMap = (map, [x, y]) => map[y] !== undefined && map[y][x] !== undefined;

const DIR = {
    '>': 0,
    '<': 1,
    '^': 2,
    'v': 3,
}

const DIRS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
]

const solve = ([moves, food]) => {
    let snake = [0,0], foodPtr = 0, movePtr = 0, res = 0;
    while (movePtr < moves.length/2) {
        snake[0] += DIRS[ DIR[ moves[movePtr] ] ][0];
        snake[1] += DIRS[ DIR[ moves[movePtr] ] ][1];
        if (snake[0] === food[foodPtr][0] && snake[1] === food[foodPtr][1]) {
            res++;
            foodPtr++;
        }
        movePtr++;
    }
    return res;
}

const solve2 = ([moves, food]) => {
    let snake = [[0,0]], foodPtr = 0, movePtr = 0;
    while (movePtr < moves.length) {
        let growthSegment = snake[0].slice();
        for (let i = snake.length-1; i > 0; i--) snake[i] = snake[i-1].slice(); // movement of the body

        snake[0][0] += DIRS[ DIR[ moves[movePtr] ] ][0];
        snake[0][1] += DIRS[ DIR[ moves[movePtr] ] ][1];

        let collision = false;
        for (let i = 1; i < snake.length; i++) {
            if (snake[i][0] === snake[0][0] && snake[i][1] === snake[0][1]) collision = true;
        }
        if (collision) break;

        if (foodPtr < food.length && snake[0][0] === food[foodPtr][0] && snake[0][1] === food[foodPtr][1]) {
            snake.push(growthSegment);
            foodPtr++;
        }
        movePtr++;
    }
    return snake.length;
}


const solve3 = ([moves, food]) => {
    let snake = [[0,0]], foodPtr = 0, movePtr = 0, cuts = 0;
    while (movePtr < moves.length) {
        let growthSegment = snake[0].slice();
        for (let i = snake.length-1; i > 0; i--) snake[i] = snake[i-1].slice(); // movement of the body

        snake[0][0] += DIRS[ DIR[ moves[movePtr] ] ][0];
        snake[0][1] += DIRS[ DIR[ moves[movePtr] ] ][1];

        let collision = false;
        for (let i = 1; i < snake.length; i++) {
            if (snake[i][0] === snake[0][0] && snake[i][1] === snake[0][1]) {
                collision = i;
                break;
            }
        }
        if (collision !== false) {
            snake = snake.slice(0, collision-1);
            cuts++
        }

        if (foodPtr < food.length && snake[0][0] === food[foodPtr][0] && snake[0][1] === food[foodPtr][1]) {
            snake.push(growthSegment);
            foodPtr++;
        }
        movePtr++;
    }
    return snake.length * cuts;
}

console.log('p1', solve(parse(input)));
console.log('p2', solve2(parse(input)));
console.log('p3', solve3(parse(input)));