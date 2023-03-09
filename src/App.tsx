import './assets/style/App.scss';
import { useEffect, useRef, useState } from 'react';
import { ColorCard } from './cmps/color-card';
import timeout from './util.service';

interface Play {
  isDisplay: boolean;
  colors: string[];
  score: number;
  userPlay: boolean;
  userColors: string[];
}

// let green =
//   Audio.make("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3");
// let red =
//   Audio.make("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3");
// let blue =
//   Audio.make("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3");
// let yellow =
//   Audio.make("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3");
// let error =
//   Audio.make(
//     "https://s3.amazonaws.com/adam-recvlohe-sounds/success.wav")

const sounds = [
  new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
  new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
  new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
  new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
  new Audio("https://s3.amazonaws.com/adam-recvlohe-sounds/error.wav")
]

enum ColorIndex {
  green = 0,
  red = 1,
  blue = 2,
  yellow = 3,
  error = 4,
}

function App() {

  const gameBoardRef = useRef<HTMLDivElement>(null);
  const colorList: string[] = ['green', 'red', 'yellow', 'blue']
  const initPlay: Play = {
    isDisplay: false,
    colors: [],
    score: 0,
    userPlay: false,
    userColors: []
  }

  const [isOn, setIsOn] = useState(false)
  const [bestScore, setBestScore] = useState<number>(0);
  const [play, setPlay] = useState<Play>(initPlay);
  const [flashColor, setFlashColor] = useState<string>('');

  useEffect(() => {

    if (isOn) {
      setPlay({ ...initPlay, isDisplay: true })
    } else {
      setPlay(initPlay)
    }

  }, [isOn])


  useEffect(() => {
    if (isOn && play.isDisplay) {
      let newColor = colorList[Math.floor(Math.random() * 4)]

      const gameColors = [...play.colors]
      gameColors.push(newColor)
      setPlay({ ...play, colors: gameColors })

      console.log('play.colors = ', play.colors)
    }

  }, [isOn, play.isDisplay])

  useEffect(() => {
    if (isOn && play.isDisplay && play.colors.length) {
      displayRandColor()
    }
  }, [isOn, play.isDisplay, play.colors.length])

  function handleStart() {
    setIsOn(true)
  }

  async function displayRandColor(): Promise<void> {

    const timeoutValue = play.colors.length > 10 ? 500 : 700;
    await timeout(timeoutValue);

    play.colors.reduce(async (prevPromise, color, i) => {
      await prevPromise;
      await timeout(timeoutValue);
      setFlashColor(color);
      playSound(color)

      await timeout(300);
      setFlashColor("");

      if (i === play.colors.length - 1) {
        const copyColors = [...play.colors];

        setPlay({
          ...play,
          isDisplay: false,
          userPlay: true,
          userColors: copyColors.reverse(),
        });
      }
    }, Promise.resolve());
  }

  function playSound(color: keyof typeof ColorIndex) {
    const index = ColorIndex[color];
    const audioEl = sounds[index];
    audioEl.currentTime = 0;
    audioEl.volume = 0.1;
    audioEl.play();
  }

  async function handleCardClick(color) {
    if (!play.isDisplay && play.userPlay) {

      const copyUserColors = [...play.userColors]
      const lastColor = copyUserColors.pop()

      setFlashColor(color)

      if (color === lastColor) {
        playSound(color)
        if (copyUserColors.length) {
          setPlay({ ...play, userColors: copyUserColors })
        } else {
          await timeout(300)
          setPlay({ ...play, isDisplay: true, userPlay: false, score: play.colors.length, userColors: [] })
        }

      } else {
        await timeout(500)
        setPlay({ ...initPlay, score: play.colors.length })
        playSound('error')
        if (play.colors.length > bestScore) {
          setBestScore(play.colors.length)
        }
      }

      await timeout(700)
      setFlashColor('')
    }
    return
  }

  function handleClose() {
    setIsOn(false)
  }


  return (
    <div className="App">
      <div className='best-score'>Best score: {bestScore}</div>

      <div className='wrapper-container'>

        <div className='card-wrapper'>
          {colorList?.map((color, idx) => (<ColorCard onClick={() => handleCardClick(color)} key={idx} color={color} flash={flashColor === color} />))}


          {isOn && !play.isDisplay && !play.userPlay && play.score && <div onClick={handleClose} className='btn lost'>
            Finale Score <br /> {play.score}
          </div>
          }

          {!isOn && !play.score && <div onClick={handleStart} className='btn start-btn'>START</div>}

          {isOn && (play.isDisplay || play.userPlay) && <div className='btn score'>{play.score}</div>}

        </div>
      </div>
    </div>
  )
}

export default App
