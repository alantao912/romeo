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
    remainingTime: number;
    isRunning: boolean;
};

function Timer({remainingTime, isRunning }: TimerProps) : JSX.Element {

    let cName: string = "timer-display";
    if (isRunning && remainingTime <= 300 && remainingTime > 0 && remainingTime % 10 >= 6) {
        cName += "-warning";
    }
    return <h4 className={cName}> { formatTime(remainingTime) } </h4>
}

export default Timer;