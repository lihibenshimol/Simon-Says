
import './App.scss';
import { useEffect, useState } from 'react';
import { ColorCard } from './cmps/color-card';
import timeout from './util.service';

function App() {

  const [isOn, setIsOn] = useState(false)
  const [bestScore, setBestScore] = useState(0)

  const colorList = ['green', 'red', 'yellow', 'blue']

  const initPlay = {
    isDisplay: false,
    colors: [],
    score: 0,
    userPlay: false,
    userColors: []
  }

  const [play, setPlay] = useState(initPlay)
  const [flashColor, setFlashColor] = useState("")

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

  async function displayRandColor() {

    const timeoutValue = play.colors.length > 10 ? 500 : 700;
    // const timeoutValue = play.colors.length > 4 ? 300 : play.colors.length > 2 ? 500 : 700;
    // const timeoutValue = play.colors.length > 18 ? 300 : play.colors.length > 10 ? 500 : 700;


    await timeout(timeoutValue);

    play.colors.reduce(async (prevPromise, color, i) => {
      await prevPromise;
      await timeout(timeoutValue);
      setFlashColor(color);
      await timeout(timeoutValue);
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
  // async function displayRandColor() {
  //   await timeout(700);

  //   play.colors.reduce(async (prevPromise, color, i) => {
  //     await prevPromise;
  //     await timeout(700);
  //     setFlashColor(color);
  //     await timeout(700);
  //     setFlashColor("");

  //     if (i === play.colors.length - 1) {
  //       const copyColors = [...play.colors];

  //       setPlay({
  //         ...play,
  //         isDisplay: false,
  //         userPlay: true,
  //         userColors: copyColors.reverse(),
  //       });
  //     }
  //   }, Promise.resolve());
  // }

  async function handleCardClick(color) {
    if (!play.isDisplay && play.userPlay) {

      const copyUserColors = [...play.userColors]
      const lastColor = copyUserColors.pop()

      setFlashColor(color)

      if (color === lastColor) {
        if (copyUserColors.length) {
          setPlay({ ...play, userColors: copyUserColors })
        } else {
          await timeout(700)
          setPlay({ ...play, isDisplay: true, userPlay: false, score: play.colors.length, userColors: [] })
        }

      } else {
        await timeout(700)
        setPlay({ ...initPlay, score: play.colors.length })
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

export default App;
