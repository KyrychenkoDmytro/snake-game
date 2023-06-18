import './Game.css';
import Cell from '../../components/Cell/Cell';
import { useEffect, useState } from 'react';

const BOARD_SIZE = 10;
const BOARD = Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(0)); // 10x10
const KEY_INFO = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    pause: 32
}
let SPEED = 500;

const Game = () => {
    const [snake, setSnake] = useState([[0, 0]]);
    const [food, setFood] = useState([1, 1, 10]);
    const [direction, setDirection] = useState(KEY_INFO.pause);
    const [count, setCount] = useState(0);

    const moveToOppositeSide = (posinion) => {
        if (posinion >= BOARD_SIZE) return 0;
        if (posinion < 0) return BOARD_SIZE - 1;
        return posinion
    }

    const handleKeyDown = (event) => {
        if (Object.values(KEY_INFO).includes(event.keyCode)) {
            const key = Object.keys(KEY_INFO).find(key => KEY_INFO[key] === event.keyCode);
            setDirection(KEY_INFO[key] = event.keyCode)
        }
    }

    const generateFoot = () => {
        const typesOfFood = [
            [1, 1, 1],
            [1, 1, 5],
            [1, 1, 10]
        ];

        const randomType = typesOfFood[Math.floor(Math.random() * typesOfFood.length)];

        let newFood = [
            Math.floor(Math.random() * BOARD_SIZE),
            Math.floor(Math.random() * BOARD_SIZE),
            randomType[2]
        ];

        let isSnake = snake.some(elem => elem[0] === newFood[0] && elem[1] === newFood[1]);
        if (!isSnake) {
            setFood(newFood);
        } else {
            generateFoot();
        }
    };

    const snakeMove = () => {
        const timer = setTimeout(() => {
            const newSnake = snake;
            let move = [];

            switch (direction) {
                case KEY_INFO.pause:
                    move = [0, 0];
                    break;
                case KEY_INFO.up:
                    move = [-1, 0];
                    break;
                case KEY_INFO.down:
                    move = [1, 0];
                    break;
                case KEY_INFO.left:
                    move = [0, -1];
                    break;
                case KEY_INFO.right:
                    move = [0, 1];
                    break;
                default:
                    console.log('ayaa');
            }

            const head = [
                moveToOppositeSide(newSnake[newSnake.length - 1][0] + move[0]),
                moveToOppositeSide(newSnake[newSnake.length - 1][1] + move[1])
            ];
            newSnake.push(head);

            let sliceIndex = 1;
            if (head[0] === food[0] && head[1] === food[1]) {
                sliceIndex = 0;
                generateFoot();
                setCount((count) => count + food[2]);
            }
            setSnake(newSnake.slice(sliceIndex));

        }, SPEED)
        return timer;
    }

    // move snake
    useEffect(() => {
        const interval = snakeMove();
        return () => {
            clearInterval(interval);
        }
    }, [snake]);

    // keydown listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="Game">
            <h1>count: {count}</h1>
            {
                BOARD.map((row, indexRow) => (
                    <div className='row' key={indexRow}>
                        {
                            row.map((_, indexCell) => {
                                let type = snake.some(elem => elem[0] === indexRow && elem[1] === indexCell) && 'snake'; // snake

                                if (type !== 'snake') {

                                    if (food[2] === 1) {
                                        type = (food[0] === indexRow && food[1] === indexCell) && 'food-1';
                                    }
                                    if (food[2] === 5) {
                                        type = (food[0] === indexRow && food[1] === indexCell) && 'food-5';
                                    }
                                    if (food[2] === 10) {
                                        type = (food[0] === indexRow && food[1] === indexCell) && 'food-10';
                                    }
                                }
                                return (
                                    <Cell type={type} key={indexCell} />
                                )
                            })
                        }
                    </div>
                ))}
        </div>
    )
}

export default Game;