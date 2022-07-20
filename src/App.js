import React from 'react'
import Die from "./components/Die"

export default function App() {
    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(() => 60)
    const [rollCount, setRollCount] = React.useState(()=> 10)
    const [record, setRecord] = React.useState(()=>JSON.parse(localStorage.getItem('record')) || [])


    React.useEffect(() => {
        const firstValue = dice[0].value
        const allHeld = dice.every(die => die.held)
        const allSameNumber = dice.every(die => die.value === firstValue)
        if(allHeld && allSameNumber) {
            setTenzies(true)
            if (record[0].time < timeLeft && record[0].rollCount < rollCount ){
                setRecord([{
                    'time': timeLeft,
                    'rollCount': rollCount
                }])
                localStorage.setItem('record', JSON.stringify(record))
            }
        }
    }, [dice])

    React.useEffect(() => {
        if(rollCount === 0){
          setTenzies(true)  
        } 
    }, [rollCount])


    React.useEffect(() => {
        const interval = setInterval(()=> {
            if(timeLeft > 0 && rollCount > 0 && !tenzies){
                setTimeLeft(time => time-1)
            }else {
                clearInterval(interval)
                setTenzies(true)
            }
       }, 1000)
        return () => clearInterval(interval) 
    }, [timeLeft])

    function reset(){
        setDice(allNewDice())
        setTenzies(false)
        setRollCount(10)
        setTimeLeft(60)
    }

    function randomDieValue() {
        return Math.ceil(Math.random() * 6)
    }

    function allNewDice() {
        const newArray = []
        for(let i = 0; i < 10; i++) {
            const newDie = {
                value: randomDieValue(),
                held: false,
                id: i + 1
            }
            newArray.push(newDie)
        }
        return newArray
    }

    function rollUnheldDice() {
        if (!tenzies) {
            setDice((oldDice) => oldDice.map((die, i) =>
                die.held ? 
                    die : 
                    { value: randomDieValue(), held: false, id: i + 1 }
            ))
            setRollCount(count => count-1)
        } else {
            reset()
        }
    }

    function holdDice(id) {
        if(!tenzies){
            setDice(prevDice => prevDice.map(die => {
                return die.id === id ? 
                    {...die, held: !die.held} : 
                    die
            }))
        }
    }

    const diceElements = dice.map((die) => (
        <Die key={die.id} {...die} hold={() => holdDice(die.id)} />
    ))
                // {tenzies || !timeLeft || !rollCount ? "Reset Game" : "Roll"}
            

    return (
        <main>
            <h1>Tenzies</h1>
            <p>Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div>Time Left: {timeLeft}s </div>
            <div>Rolls Left: {rollCount} </div>
            {record[0] && 
                <div>
                    <span>Record Best: {record[0].time}s - {record[0].rollCount} rolls</span>
                </div>
            }
            <div className="die-container">{diceElements}</div>
            <button className="roll-dice" onClick={rollUnheldDice}>
                {tenzies ? "Reset Game" : "Roll"}
            </button>
            {!timeLeft && <div>Run out of time. You Lose!</div>}
            {!rollCount && <div>Youve used all your Rolls. You Lose!</div>}
        </main>
    )
}
