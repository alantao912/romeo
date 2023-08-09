import { useState } from 'react';
import './Timer.css';

function formatTime(time: number) : string {
    let minutes: string = Math.floor(time / 600) + "";
    let seconds: string = Math.floor((time - 600 * Math.floor(time / 600)) / 10) + "";
    let milliseconds = time % 10;
    if (minutes.length < 2) {
        minutes = "0" + minutes;
    }
    if (seconds.length < 2) {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds + "." + milliseconds;
}

interface TimerProps {
    startTime: string;
    onFlag: Function;
    isRunning: Function;
};

function Timer({startTime, onFlag, isRunning}: TimerProps) : JSX.Element {
    const [ milliseconds, setMilliseconds] = useState(parseInt(startTime));

    if (isRunning()) {
        if (milliseconds > 0) {
            setTimeout(() => { setMilliseconds(milliseconds - 1)}, 100);
        } else {
            onFlag();
        }
    }

    let cName: string = "timer-display";
    if (isRunning() && milliseconds <= 30 && milliseconds > 0 && milliseconds % 10 >= 6) {
        cName += "-warning";
    }
    return <h4 className={cName}> { formatTime(milliseconds) } </h4>
}

export default Timer;