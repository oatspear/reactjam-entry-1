import { useEffect, useState } from "react";
import "./App.css";
import { GameState } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BgInterface from "./components/BgInterface.tsx";

function App() {
  const [game, setGame] = useState<GameState>();

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, oldGame, yourPlayerId }) => {
        setGame(newGame);
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  const onButtonPress = () => {
    // const x = game.count > 3 ? -game.count : 1;
    // Rune.actions.increment({ amount: x });
    if (game.tasks.length === 0) { return }
    Rune.actions.completeTask({ id: game.tasks[0].id });
  };

  return (
    <>
      <div className="card">
        <button onClick={onButtonPress}>
          count is {game.count}
        </button>
      </div>
      <HUD notifications={game.tasks} score={game.score} timer={game.timer} />
      <BgInterface />
    </>
  );
}

export default App;
