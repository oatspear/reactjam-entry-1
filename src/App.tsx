import { useEffect, useState } from "react";
import "./App.css";
import { BookPurchase, GameState, TASK_TYPE_BOOK_PURCHASE, Task } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BookShelf from "./components/interface/Bookshelf.tsx";
import Cashier from "./components/interface/Cashier.tsx";
import BookPile from "./components/interface/BookPile.tsx";
import Person from "./components/interface/Person.tsx";
import Person2 from "./components/interface/Person2.tsx";
import SellBooks from "./components/actions/SellBooks.tsx";


function App(): JSX.Element {
  const [game, setGame] = useState<GameState>();
  const [myPlayerId, setMyPlayerId] = useState<string | undefined>();

  const [currentTask, setCurrentTask] = useState<Task | undefined>();

  const [cashierBooks, setCashierBooks] = useState<number>(0);
  const [cashierTimeout, setCashierTimeout] = useState<number>(1);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, yourPlayerId }) => {
        // unused param: oldGame
        setMyPlayerId(yourPlayerId);
        setGame(newGame);
        // set cashier state
        if (newGame.tasks.length === 0) {
          setCashierBooks(0);
          setCashierTimeout(1);
        } else {
          const task = newGame.tasks[newGame.tasks.length - 1] as BookPurchase;  // longest to run out
          setCashierBooks(task.amount);
          setCashierTimeout(task.timer);
        }
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
    const n = game?.tasks.length;
    if (!n) { return }
    setCurrentTask(game.tasks[n-1]);  // highest timer left
  }

  function cancelTask() {
    setCurrentTask(undefined);
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

        <footer>Images: Freepik.com</footer>
      </div>

      {
        currentTask != null &&
        <div className="action-panel">{
          currentTask.type === TASK_TYPE_BOOK_PURCHASE
          ? <SellBooks amount={cashierBooks} timer={cashierTimeout} cancelTask={cancelTask} />
          : `Handling task ${currentTask.id}`
        }</div>
      }
    </>
  );
}

export default App;
