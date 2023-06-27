import './Game.css';
import Cell from '../../components/Cell/Cell';
import Modal from '../../components/Modal/Modal';
import { useEffect, useState } from 'react';
import axios from '../../axios';
import { throttle } from 'lodash';

const BOARD_SIZE = 10;
const BOARD = Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(0)); // 10x10
const KEY_INFO = {
  up: 38,
  down: 40,
  left: 37,
  right: 39,
  pause: 32,
};
const SPEED = {
  1: 440,
  2: 400,
  3: 360,
  4: 320,
  5: 280,
  6: 240,
  maxSpeed: 200,
};

const Game = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [bestScore, setBestScore] = useState(0);
  const [topRecords, setTopRecords] = useState([]);
  const [snake, setSnake] = useState([[0, 0]]);
  const [food, setFood] = useState([]);
  const [direction, setDirection] = useState(KEY_INFO.pause);
  const [count, setCount] = useState(0);
  const [isStartGame, setIsStartGame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [foundFoodIndex, setFoundFoodIndex] = useState(-1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState('');

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

  const handleKeyDownThrottled = throttle((event) => {
    const newDirection = event.keyCode;
    if (newDirection === KEY_INFO.up || newDirection === KEY_INFO.down || newDirection === KEY_INFO.left || newDirection === KEY_INFO.right) {
      setIsStartGame(true);
    }
    if (Object.values(KEY_INFO).includes(newDirection)) {
      if (newDirection === KEY_INFO.pause) {
        setIsPaused((isPaused) => {
          const newPaused = !isPaused;
          if (!newPaused) {
            setTimerId(snakeMove(count));
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
  }, SPEED[currentSpeed]);

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
    const occupiedPositions = [...snake, ...food].map(([row, col]) => [row, col]);

    const totalCells = BOARD_SIZE * BOARD_SIZE;
    if (snake.length >= totalCells - 3) {
      return;
    }

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

  const checkSpeed = (speed) => {
    if (speed < 50) {
      return '1';
    } else if (speed >= 50 && speed < 100) {
      return '2';
    } else if (speed >= 100 && speed < 150) {
      return '3';
    } else if (speed >= 150 && speed < 200) {
      return '4';
    } else if (speed >= 200 && speed < 250) {
      return '5';
    } else if (speed >= 250 && speed < 300) {
      return '6';
    } else if (speed >= 300) {
      return 'maxSpeed';
    }
  };

  const snakeMove = (count) => {
    if (isStartGame) {
      const lvlSpeed = checkSpeed(count);
      setCurrentSpeed(lvlSpeed);
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
            handleGameCompletion();
          }

          if (newSnake.length === BOARD_SIZE * BOARD_SIZE) {
            handleGameCompletion();
          }

          return newSnake.slice(sliceIndex);
        });
      }, SPEED[lvlSpeed]);
      setTimerId(timer);
    }
  };

  const handleGameCompletion = () => {
    setIsGameOver(true);
    clearTimeout(timerId);
    sendGameResultsToServer();
    alert(`Game End!!!!! Your score: ${count}`);
    return snake;
  }

  const restartGame = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchTopRecords = async () => {
      const { data } = await axios.get();
      setTopRecords(data.allPlayers);
    }
    fetchTopRecords();
  }, [])

  useEffect(() => {
    if (!isGameOver) {
      setTimerId(snakeMove(count));
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [snake, isGameOver, count, isStartGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownThrottled);
    return () => {
      window.removeEventListener('keydown', handleKeyDownThrottled);
    };
  }, [direction]);

  useEffect(() => {
    generateFood();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('', { name, bestScore });
      console.log(response);
      if (response.status >= 200 && response.status <= 299) {
        setIsLogin(!isLogin)
        setName(response.data.name);
        const { bestScore } = response.data;
        setBestScore(bestScore);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendGameResultsToServer = async () => {
    try {
      const response = await axios.post('', { name, bestScore: count });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="Game">
      {!isLogin ? (
        <form className='Game__form' onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Your Name"
            required />
          <button>Submit</button>
        </form>
      ) : <>
        {isGameOver ? (
          <Modal count={count} restartGame={restartGame} />
        ) : (
          <>
            <div className="left">
              <h1>Your name: {name}</h1>
              <h2>Your record: {bestScore}</h2>
            </div >
            <div className="center">
              <h1 style={{ textAlign: 'center' }}>Count: {count}</h1>
              <h2 style={{ textAlign: 'center' }}>Speed: {currentSpeed}</h2>
              {BOARD.map((row, indexRow) => (
                <div className="row" key={indexRow}>
                  {row.map((_, indexCell) => {
                    let type =
                      snake.some(
                        (elem) => elem[0] === indexRow && elem[1] === indexCell
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
              <p style={{ textAlign: 'center', fontSize: '22px' }}>Select the direction of the snake to start the game: "<b>up</b>", "<b>down</b>", "<b>left</b>" or "<b>right</b>"</p>
            </div>
            <div className="right">
              <h1>Top 5 record holders:</h1>
              <ul>
                {topRecords.map((item, index) => (
                  <li
                    key={index}
                    style={{ fontSize: '30px' }}
                  >
                    <i>{item.name}</i>: <b>{item.bestScore}</b>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </>
      }
    </div >
  );
};

export default Game;