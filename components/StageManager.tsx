// components/StageManager.tsx "use client";

import React, { useEffect, useState } from "react";

export default function StageManager() { const [stage, setStage] = useState(1); const [startTime, setStartTime] = useState<number | null>(null); const [endTime, setEndTime] = useState<number | null>(null); const [completedStages, setCompletedStages] = useState<number[]>([]);

useEffect(() => { if (startTime === null) setStartTime(Date.now()); }, [stage]);

const completeStage = () => { const now = Date.now(); const timeTaken = now - (startTime || now); setCompletedStages([...completedStages, stage]); setEndTime(now);

if (stage < 5) {
  setStage(stage + 1);
  setStartTime(now);
} else {
  const totalTime = now - (startTime || now);
  const shareUrl = `https://warpcast.com/frames?nadshoott_time=${totalTime}`;
  alert(`Game Completed in ${totalTime / 1000}s! Share your time!`);
  window.open(shareUrl, "_blank");
}

};

return ( <div className="text-center text-white space-y-4"> <h2 className="text-2xl font-bold">Stage {stage} / 5</h2> <button
className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
onClick={completeStage}
> Complete Stage {stage} </button> </div> ); }

