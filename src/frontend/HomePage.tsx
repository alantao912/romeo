import julietteLogo from "./assets/juliette-logo.png";
import { useState } from 'react';

import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import Timer from './components/Timer';
import './HomePage.css';

function HomePage() : JSX.Element {
    const [ state, setState ] = useState(0);
    const [ turn, setTurn ] = useState(0);

    const [game, setGame] = useState(new Chess());

    async function getEngineMove() {
        const gameCopy: Chess = new Chess(game.fen());
        
        setGame(gameCopy);
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
            let playerColor: string = (Date.now() % 2 == 0 ? "w" : "b");
            function onDrop(sourceSquare: Square, targetSquare: Square, piece : string) : boolean {
                if (playerColor !== String(piece[0])) {
                    return false;
                }
                const gameCopy: Chess = new Chess(game.fen());
                try {
                    gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: piece[1].toLowerCase() ?? "q"});
                    setGame(gameCopy);
                } 
                catch {
                    return false;
                }
                
                switch (turn) {
                    case 0:
                        setTurn(1);
                        break;
                    case 1:
                        setTurn(2);
                        break;
                    case 2:
                        setTurn(1);
                        break;
                }
                getEngineMove();
                return true;
            }

            if (turn == 0 && playerColor === "b") {
                setTurn(1);
                getEngineMove();
                setTurn(2);
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
                        onPieceDrop={onDrop}
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