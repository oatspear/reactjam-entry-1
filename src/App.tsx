import { useEffect, useState } from "react";
import "./App.css";
import { GameState, Task } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BgInterface from "./components/BgInterface.tsx";
import BookShelf from "./components/interface/Bookshelf.tsx";
import Cashier from "./components/interface/Cashier.tsx";
import BookPile from "./components/interface/BookPile.tsx";
import Person from "./components/interface/Person.tsx";
import Person2 from "./components/interface/Person2.tsx";

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

      <!-- <BgInterface game={game} setCurrentTask={setCurrentTask} /> -->
      <div className="bg-interface">
        <BookShelf className={"bookshelf-one"} handleClick={handleClick} />
        <BookShelf className={"bookshelf-two"} handleClick={handleClick}/>
        <BookShelf className={"bookshelf-three"} handleClick={handleClick}/>
        <BookPile className={"book-pile"} handleClick={handleClick} />
        <Cashier className={"cashier"} />
        <Person className={"person"} handleClick={handleClick} />
        <Person2 className={"person"} handleClick={handleClick} />
      </div>

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
