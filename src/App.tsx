import { useEffect, useState } from "react";
import "./App.css";
import { GameState } from "./logic.ts";
import HUD from "./components/HUD.tsx";

function App() {
  const [game, setGame] = useState<GameState>()
  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame }) => {
        setGame(newGame)
      },
    })
  }, [])

  if (!game) {
    return <div>Loading...</div>
  }

  const onButtonPress = () => {
    const x = game.count > 3 ? -game.count : 1;
    Rune.actions.increment({ amount: x });
  };

  return (
    <>
      <h1>Vite + Rune</h1>
      <div className="card">
        <button onClick={onButtonPress}>
          count is {game.count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> or <code>src/logic.ts</code> and save to
          test HMR
        </p>
      </div>
      <HUD notifications={game.count}></HUD>
    </>
  )
}

export default App
