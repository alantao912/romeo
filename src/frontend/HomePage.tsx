import julietteLogo from "./assets/juliette-logo.png";
import { useState, useEffect } from 'react';

import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import Timer from './components/Timer';
import './HomePage.css';

const deployURL: string = 'http://3.91.131.162:3000/chess';
const devURL: string = 'http://localhost:3000/chess';

interface HomePageProps {
    playerColor: string;
    startTime: number;
    increment: number;
}

interface ReturnValue {
    isLegal: boolean;
    newPosition: string;
}

let lossReason: string = "";
let firstMove: boolean = false;

function getHistory(history: string[]) : string {
    let output: string = "";
    history.map((item) => { 
        output += item; 
        console.log(item);
    });
    return output;
}

function HomePage({ playerColor, startTime, increment } : HomePageProps) : JSX.Element {
    const [ state, setState ] = useState(0);
    const [ turn, setTurn ] = useState(playerColor === "w" ? 2 : 0);

    const [ game, setGame ] = useState(new Chess());

    const [ playerTime, setPlayerTime ] = useState(startTime);
    const [ engineTime, setEngineTime ] = useState(startTime);

    const [ numEngineMoves, setNumEngineMoves ] = useState(0);

    useEffect(() => {
        if (numEngineMoves != 0) {
            setTimeout(() => setEngineTime(engineTime + increment), 100);
        }
    }, [numEngineMoves]);

    useEffect(() => {
        if (game.isCheckmate()) {
            lossReason = "Checkmate!";
            setTimeout(() => {setState(2);}, 500);
        } else if (game.isDraw()) {
            lossReason = "Draw";
            setTimeout(() => {setState(2);}, 500);
        }
    }, [ game ]);

    function getEngineMove(fen: string) {
        const headers: Headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        const request: RequestInfo = new Request(deployURL, {
            // We need to set the `method` to `POST` and assign the headers
            method: 'POST',
            headers: headers,
            // Convert the user object to JSON and pass it as the body
            body: JSON.stringify({ position: fen, remainingTime: 100 * engineTime})
        });

        fetch(request).then(res => res.json()).then(res => {
            const gameCopy: Chess = new Chess(fen);
            const bestMove: string = res.bestmove;
            try {
                let prom: string = "";
                if (bestMove.length === 5) {
                    prom = bestMove[4];
                }
                gameCopy.move({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4), promotion: prom});
                setGame(gameCopy);
                setNumEngineMoves(numEngineMoves + 1);
                setTurn(2);
            } 
            catch {
                lossReason = "juliette made illegal move!";
                setState(2);
            }
        }).catch(error => {
            console.log("Caught error: " + error);
        });
    }

    switch (state) {
        case 0:
            return (
                <>
                    <div>
                        <button onClick={() => setState(1)} className="juliette-logo-button">
                            <img src={julietteLogo} className="juliette-logo" alt="juliette logo" />
                        </button>

                        <h1>Play juliette!</h1>
                    </div>
                </>
            );
        case 1:
            function onDrop(sourceSquare: Square, targetSquare: Square, piece : string) : ReturnValue {
                if (playerColor !== String(piece[0])) {
                    return { isLegal: false, newPosition: ""};
                }
                const gameCopy: Chess = new Chess(game.fen());
                try {
                    gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: piece[1].toLowerCase() ?? "q"});
                    setGame(gameCopy);
                } 
                catch {
                    return { isLegal: false, newPosition: ""};
                }
                setTurn(1);
                setTimeout(() => setPlayerTime(playerTime + increment), 100);
                return { isLegal: true, newPosition: gameCopy.fen() };
            }

            if (turn === 2) {
                // player turn
                setTimeout(() => {
                    if (playerTime > 0) {
                        setPlayerTime(playerTime - 1);
                    } else {
                        lossReason = "Player flagged!";
                        setState(2);
                    }
                }, 100);
            } else if (turn === 1 || turn === 0) {
                // engine turn
                setTimeout(() => {
                    if (engineTime > 0) {
                        setEngineTime(engineTime - 1);
                    } else {
                        lossReason = "juliette flagged!";
                        setState(2);
                    }
                }, 100);
            }

            if (!firstMove && playerColor === "b") {
                firstMove = true;
                getEngineMove(game.fen());
            }

            return (
                <div className="board-area">
                    <div className="play-area">
                        <div className="player-one-display">
                            <Timer remainingTime={ engineTime } isRunning={turn === 1 || turn === 0} />
                            <h4 className="engine-label"> juliette </h4>
                        </div>
                        <Chessboard 
                            id="chessboard"
                            position={ game.fen() }
                            boardOrientation={playerColor === "w" ? "white" : "black"}
                            onPieceDrop={
                                (x, y, z) => {
                                let result: ReturnValue = onDrop(x, y, z);
                                if (result.isLegal) {
                                    getEngineMove(result.newPosition);
                                    return true;
                                }
                                return false;
                            }}
                            areArrowsAllowed={true} 
                            boardWidth={850} 
                            showPromotionDialog={true}
                            customBoardStyle={{
                                borderRadius: "4px",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                            }}
                        />
                        <div className="player-two-display">
                            <h4 className="player-label"> Player </h4>
                            <Timer remainingTime={ playerTime } isRunning={turn === 2} />
                        </div>
                    </div>

                    <button className="resign-button" onClick={() => {
                        lossReason="juliette wins by resignation!";
                        setState(2);
                    }}> Resign </button>
                </div>
            );
        case 2:
            return (
                <>
                    <h3> Game Over! </h3>
                    <p> { lossReason } </p>
                    <button className="end-screen-button" onClick={() => {
                        navigator.clipboard.writeText(getHistory(game.history({verbose: false})));
                    }}> Copy PGN </button>

                    <button className="end-screen-button" onClick={() => {
                        setState(0);
                        game.reset();
                        setEngineTime(startTime);
                        setPlayerTime(startTime);
                        setTurn(playerColor === "w" ? 2 : 0)
                    }}> Home </button>
                </>
            );
        default:
            return <p> Error </p>
    }
}

export default HomePage;
