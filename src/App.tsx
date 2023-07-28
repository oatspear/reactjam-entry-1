import { useEffect, useState } from "react";
import "./App.css";
import { GameState, Task } from "./logic.ts";
import HUD from "./components/HUD.tsx";
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

  function handleClick() {}

  function handleShelfClick(i: number): void {
    const shelf = game?.bookshelves[i];
    if (shelf == null) { return }
    if (shelf.sortingTasks.length === 0) { return }
    setCurrentTask(shelf.sortingTasks[0]);
  }

  function handleCashierClick(): void {
    if (!game?.tasks.length) { return }
    setCurrentTask(game.tasks[0]);
  }

  return (
    <>
      <HUD notifications={game.tasks} score={game.score} timer={game.timer} />

      <div className="bg-interface">
        <BookShelf className={"bookshelf-one"} handleClick={() => handleShelfClick(0)} />
        <BookShelf className={"bookshelf-two"} handleClick={() => handleShelfClick(1)}/>
        <BookShelf className={"bookshelf-three"} handleClick={() => handleShelfClick(2)}/>
        <BookPile className={"book-pile"} handleClick={handleClick} />
        <Cashier className={"cashier"} handleClick={handleCashierClick} />
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
