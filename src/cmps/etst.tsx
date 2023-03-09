import { useEffect, useRef, useState } from 'react'
import { Instructions } from '../cmps/Instructions'
import { Color } from '../interfaces/Color'
import { simonService } from '../services/simonsays.service'
import { utilService } from '../services/util.service'
import Lottie from 'lottie-react'
import confettiAnimation from '../../assets/images/lottie/confetti.json'

const colors: Color[] = [
    { name: 'green', sound: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3') },
    { name: 'red', sound: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3') },
    { name: 'yellow', sound: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3') },
    { name: 'blue', sound: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3') },
]

const SHOW_HIGHLIGHT_TIME = 250
const SHOW_HIGHLIGHT_DELAY = 1000
const WRONG_SOUND = new Audio('https://res.cloudinary.com/dsperrtyj/video/upload/v1677759437/wrong_xyf7uj.wav')
const CORRECT_SOUND = new Audio('https://res.cloudinary.com/dsperrtyj/video/upload/v1677759436/correct_ranvto.wav')
const NEW_SCORE_SOUND = new Audio('https://res.cloudinary.com/dsperrtyj/video/upload/v1677796731/new-score2_irvwx9.wav')

export const Home = () => {
    const [level, setLevel] = useState<number>(0)
    const [bestScore, setBestScore] = useState<number>(0)
    const [isGameOn, setIsGameOn] = useState(false)
    const [isPlayerMove, setIsPlayerMove] = useState(false)
    const [isInstructionOpen, setIsInstructionsOpen] = useState(false)
    const sequence = useRef<Color[]>([])
    const gameBoardRef = useRef<HTMLDivElement>(null)
    const playerClick = useRef<number>(0)
    const isNewBestScore = useRef<boolean>(false)

    useEffect(() => {
        if (bestScore <= 1) return
        ;(async () => {
            try {
                await simonService.setBestScore(bestScore)
            } catch (error) {
                console.error(error)
            }
        })()
    }, [bestScore])

    useEffect(() => {
        ;(async () => {
            try {
                const userScore: { [key: string]: number } = await simonService.getUserScore()
                setBestScore(userScore.bestScore)
            } catch (error) {
                console.error(error)
            }
        })()
    }, [])

    useEffect(() => {
        if (!isGameOn) return
        addNextToSequence()
        highlightSequence()
    }, [level, isGameOn])

    function addNextToSequence() {
        const randomNum = Math.floor(Math.random() * 3)
        let nextInSequence = colors[randomNum]
        sequence.current.push(nextInSequence)
    }

    async function highlightSequence() {
        for (let i = 0; i < sequence.current.length; i++) {
            const color = sequence.current[i]
            await utilService.delay(i === 0 ? SHOW_HIGHLIGHT_DELAY : SHOW_HIGHLIGHT_TIME)
            await hilghlightColor(color)
        }
        setIsPlayerMove(true)
    }

    async function hilghlightColor(color: Color) {
        gameBoardRef.current?.classList.add(color.name)
        playSound(color.sound)
        await utilService.delay(SHOW_HIGHLIGHT_TIME)
        gameBoardRef.current?.classList.remove(color.name)
    }

    async function handleClick(color: Color) {
        if (isCorrectMove(color.name)) {
            playerClick.current++
            if (playerClick.current === level) {
                playerClick.current = 0
                setIsPlayerMove(false)
                playSoundSequentially([color.sound, CORRECT_SOUND])
                await utilService.delay(500)
                setLevel(prev => prev + 1)
                return
            }
            playSound(color.sound)
            return
        }
        if (level - 1 > bestScore) {
            playSound(NEW_SCORE_SOUND)
            setBestScore(level)
            isNewBestScore.current = true
        } else playSound(WRONG_SOUND)
        setIsGameOn(false)
    }

    function playSound(audioEl: HTMLAudioElement) {
        audioEl.currentTime = 0
        audioEl.volume = 0.1
        audioEl.play()
    }

    function playSoundSequentially(audioElements: HTMLAudioElement[]) {
        if (audioElements.length === 0) {
            return
        }
        const audioEl = audioElements.shift()!
        audioEl.currentTime = 0
        audioEl.volume = 0.1
        audioEl.addEventListener('ended', () => {
            playSoundSequentially(audioElements)
        })

        audioEl.play()
    }

    function isCorrectMove(clickedName: string): boolean {
        let clickedColor = colors.find(color => color.name === clickedName)
        return sequence.current[playerClick.current] === clickedColor
    }

    function resetGame(): void {
        playerClick.current = 0
        isNewBestScore.current = false
        sequence.current = []
        setIsPlayerMove(false)
        setIsGameOn(true)
        setLevel(1)
        setIsInstructionsOpen(false)
    }

    return (
        <>
            <div className='home'>
                <div ref={gameBoardRef} className='board'>
                    {colors.map((color, idx) => (
                        <button
                            disabled={!isGameOn || !isPlayerMove}
                            key={idx}
                            onClick={() => handleClick(color)}
                            className={`game-btn ${color.name}`}
                        ></button>
                    ))}
                    <div className='level'>
                        <h1 title='Level'>{level}</h1>
                    </div>
                </div>
                {isInstructionOpen ? (
                    <div className='modal'>
                        <Instructions resetGame={resetGame} closeModal={() => setIsInstructionsOpen(false)} />
                    </div>
                ) : (
                    <>
                        {isGameOn && (
                            <>
                                <button
                                    onClick={() => setIsInstructionsOpen(true)}
                                    className='instructions-button btn secondary rounded medium'
                                >
                                    Instructions
                                </button>
                                <span className='best-score'>Best Score: {bestScore}</span>
                            </>
                        )}
                    </>
                )}
            </div>
            {!isGameOn && (
                <div className={`modal ${isNewBestScore.current ? 'new-best' : ''}`}>
                    {!isGameOn && level === 0 ? (
                        <Instructions resetGame={resetGame} />
                    ) : (
                        <div className='game-over'>
                            <h1>Game Lost!</h1>
                            {isNewBestScore.current && <p className='new-score-msg'>But hey, New best score </p>}
                            {isNewBestScore.current && (
                                <Lottie className='lottie-wrapper' animationData={confettiAnimation} loop={true}>
                                    <p className='new-score'>{bestScore}</p>
                                </Lottie>
                            )}
                            <button onClick={resetGame} className='btn primary rounded medium'>
                                Reset
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}