// components/StageManager.tsx "use client";

import React, { useState } from "react"; import Game from "./Game";

export default function StageManager() { const [stage, setStage] = useState(1); const [totalTime, setTotalTime] = useState(0); const [gameCompleted, setGameCompleted] = useState(false);

const handleStageComplete = (timeTaken: number) => { if (stage < 5) { setStage(stage + 1); setTotalTime(totalTime + timeTaken); } else { setTotalTime(totalTime + timeTaken); setGameCompleted(true); } };

return ( <div className="min-h-screen bg-black text-white p-4"> {gameCompleted ? ( <div className="text-center"> <h1 className="text-3xl font-bold text-purple-400">Game Completed!</h1> <p className="mt-4">Total Time: {totalTime.toFixed(2)} seconds</p> <button onClick={() => { const url = https://warpcast.com/~/compose?text=NadShoott%20clear%20in%20${totalTime.toFixed( 2 )}%20seconds%20%23NadShoott; window.open(url, "_blank"); }} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded" > Share to Warpcast </button> </div> ) : ( <Game stage={stage} onStageComplete={handleStageComplete} /> )} </div> ); }

