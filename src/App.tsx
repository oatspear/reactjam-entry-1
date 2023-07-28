import { useEffect, useState } from "react";
import "./App.css";
import { GameState, Task } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BgInterface from "./components/BgInterface.tsx";

function App(): JSX.Element {
  const [game, setGame] = useState<GameState>();
  const [myPlayerId, setMyPlayerId] = useState<string | undefined>();
  const [currentTask, setCurrentTask] = useState<Task | undefined>();

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, yourPlayerId }) => {
        // unused param: oldGame
        setMyPlayerId(yourPlayerId);
        setGame(newGame);
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HUD notifications={game.tasks} score={game.score} timer={game.timer} />

      <BgInterface game={game} setCurrentTask={setCurrentTask} />

      {
        currentTask != null &&
        <div className="action-panel">
          Handling task {currentTask.id}
        </div>
      }
    </>
  );
}

export default App;
