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

  return (
    <>
      <h1>Vite + Rune</h1>
      <div className="card">
        <button onClick={() => Rune.actions.increment({ amount: 1 })}>
          count is {game.count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> or <code>src/logic.ts</code> and save to
          test HMR
        </p>
      </div>
      <HUD></HUD>
    </>
  )
}

export default App
