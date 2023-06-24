import './Game.css';
import Cell from '../../components/Cell/Cell';
import Modal from '../../components/Modal/Modal';
import { useEffect, useState } from 'react';

const BOARD_SIZE = 10;
const BOARD = Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(0)); // 10x10
const KEY_INFO = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    pause: 32,
};
let SPEED = 500;

const Game = () => {
    const [snake, setSnake] = useState([[0, 0]]);
    const [food, setFood] = useState([]);
    const [direction, setDirection] = useState(KEY_INFO.pause);
    const [count, setCount] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const [foundFoodIndex, setFoundFoodIndex] = useState(-1);
    const [isGameOver, setIsGameOver] = useState(false);

    const moveToOppositeSide = (position) => {
        if (position >= BOARD_SIZE) return 0;
        if (position < 0) return BOARD_SIZE - 1;
        return position;
    };

    const checkCollision = () => {
        const head = snake[snake.length - 1];
        const body = snake.slice(0, snake.length - 1);

        return body.some(([row, col]) => row === head[0] && col === head[1]);
    };

    const handleKeyDown = (event) => {
        const newDirection = event.keyCode;
        if (Object.values(KEY_INFO).includes(newDirection)) {
            if (newDirection === KEY_INFO.pause) {
                setIsPaused((isPaused) => {
                    const newPaused = !isPaused;
                    if (!newPaused) {
                        setTimerId(snakeMove());
                    }
                    return newPaused;
                });
            } else
                setDirection((prevDirection) => {
                    const isOppositeDirection =
                        (newDirection === KEY_INFO.up && prevDirection === KEY_INFO.down) ||
                        (newDirection === KEY_INFO.down && prevDirection === KEY_INFO.up) ||
                        (newDirection === KEY_INFO.left && prevDirection === KEY_INFO.right) ||
                        (newDirection === KEY_INFO.right && prevDirection === KEY_INFO.left);

                    if (!isOppositeDirection) {
                        return newDirection;
                    }
                    return prevDirection;
                });
        }
    };

    const generateFood = () => {
        const typesOfFood = [
            [1, 1, 1],
            [1, 1, 5],
            [1, 1, 10],
        ];
        const occupiedPositions = snake.map(([row, col]) => [row, col]);

        const newFood = [];
        for (let i = 0; i < 3; i++) {
            let randomPosition;
            do {
                randomPosition = [
                    Math.floor(Math.random() * BOARD_SIZE),
                    Math.floor(Math.random() * BOARD_SIZE),
                ];
            } while (
                occupiedPositions.some(
                    ([row, col]) => row === randomPosition[0] && col === randomPosition[1]
                )
            );
            newFood.push([...randomPosition, typesOfFood[i][2]]);
        }

        setFood(newFood);
    };

    const generateNewFood = (foundFoodIndex) => {
        const typesOfFood = [
            [1, 1, 1],
            [1, 1, 5],
            [1, 1, 10],
        ];
        const occupiedPositions = snake.map(([row, col]) => [row, col]);

        let randomPosition;
        do {
            randomPosition = [
                Math.floor(Math.random() * BOARD_SIZE),
                Math.floor(Math.random() * BOARD_SIZE),
            ];
        } while (
            occupiedPositions.some(
                ([row, col]) => row === randomPosition[0] && col === randomPosition[1]
            )
        );

        const newFood = [...randomPosition, typesOfFood[foundFoodIndex][2]];
        return newFood;
    };

    const snakeMove = () => {
        const timer = setTimeout(() => {
            if (isPaused) return;

            setSnake((snake) => {
                const newSnake = [...snake];
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
                        move = [0, 0];
                }

                const head = [
                    moveToOppositeSide(newSnake[newSnake.length - 1][0] + move[0]),
                    moveToOppositeSide(newSnake[newSnake.length - 1][1] + move[1]),
                ];
                newSnake.push(head);

                let sliceIndex = 1;
                const foundFoodIndex = food.findIndex(
                    (f) => f[0] === head[0] && f[1] === head[1]
                );
                if (foundFoodIndex !== -1) {
                    sliceIndex = 0;
                    const foundFood = food[foundFoodIndex];
                    setCount((count) => count + foundFood[2]);

                    setFoundFoodIndex(foundFoodIndex);

                    setFood((food) => {
                        const newFood = [...food];
                        newFood[foundFoodIndex] = generateNewFood(foundFoodIndex);
                        return newFood;
                    });
                }

                if (checkCollision()) {
                    setIsGameOver(true);
                    console.log(snake)
                    clearTimeout(timerId); // Остановка таймера при столкновении
                    alert(`Game Over!!!!! Your score: ${count}`);
                    return snake;

                }

                return newSnake.slice(sliceIndex);
            });
        }, SPEED);
        return timer;
    };

    const restartGame = () => {
        window.location.reload();
    };

    useEffect(() => {
        if (!isGameOver) {
            setTimerId(snakeMove());
        }
        return () => {
            clearTimeout(timerId);
        };
    }, [snake, isGameOver]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        generateFood();
    }, []);
    console.log(snake);

    return (
        <div className="Game">
            {isGameOver ? (
                <Modal count={count} restartGame={restartGame}/>
            ) : (
                <>
                    <h1>count: {count}</h1>
                    {BOARD.map((row, indexRow) => (
                        <div className="row" key={indexRow}>
                            {row.map((_, indexCell) => {
                                let type =
                                    snake.some(
                                        (elem) =>
                                            elem[0] === indexRow && elem[1] === indexCell
                                    ) && 'snake'; // snake
                                if (type !== 'snake') {
                                    const foundFood = food.find(
                                        (f) => f[0] === indexRow && f[1] === indexCell
                                    );
                                    if (foundFood) {
                                        type = `food-${foundFood[2]}`;
                                    }
                                }
                                return <Cell type={type} key={indexCell} />;
                            })}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default Game;