import julietteLogo from "./assets/juliette-logo.png";
import { useState } from 'react';

import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import Timer from './components/Timer';
import './HomePage.css';

interface HomePageProps {
    playerColor: string;
}

interface ReturnValue {
    isLegal: boolean;
    newPosition: string;
}

function HomePage({ playerColor } : HomePageProps) : JSX.Element {
    const [ state, setState ] = useState(0);
    const [ turn, setTurn ] = useState(0);

    const [game, setGame] = useState(new Chess());

    async function getEngineMove(fen: string) {
        const headers: Headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        const request: RequestInfo = new Request('http://localhost:3000/chess', {
            // We need to set the `method` to `POST` and assign the headers
            method: 'POST',
            headers: headers,
            // Convert the user object to JSON and pass it as the body
            body: JSON.stringify({ position: fen, remainingTime: 100000})
        })
        // Send the request and print the response
        fetch(request).then(res => {
            return res.json();
        }).then(res => {
            const gameCopy: Chess = new Chess(fen);
            const bestMove: string = res.bestmove;
            try {
                let prom: string = "";
                if (bestMove.length === 5) {
                    prom = bestMove[4];
                }
                gameCopy.move({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4), promotion: prom});
                setGame(gameCopy);
                setTurn(2);
            } 
            catch {
                console.log("Engine returned illegal move");
                console.log(bestMove);
                console.log(gameCopy.fen());
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
                return { isLegal: true, newPosition: gameCopy.fen() };
            }

            if (turn == 0 && playerColor === "b") {
                
            }

            return (
                <div className="play-area">
                    <div className="player-one-display">
                        <Timer startTime="3000" onFlag={() => setState(2)} isRunning={() => turn == 1}/>
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
                        <Timer startTime="3000" onFlag={() => setState(2)} isRunning={() => turn == 2}/>
                    </div>
                </div>
            );
        case 2:
            return (
                <p> Game Over! </p>
            );
        default:
            return <p> Error </p>
    }
}

export default HomePage;