import { useEffect, useState } from "react";
import "./App.css";
import { BookPurchase, GameState, TASK_TYPE_BOOK_PURCHASE, TASK_TYPE_BOOK_SORT_AUTHOR, TASK_TYPE_NONE, TaskType } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BookShelf from "./components/interface/Bookshelf.tsx";
import Cashier from "./components/interface/Cashier.tsx";
import BookPile from "./components/interface/BookPile.tsx";
import Person from "./components/interface/Person.tsx";
import Person2 from "./components/interface/Person2.tsx";
import ActionPanel from "./components/actions/ActionPanel.tsx";
import { Player } from "rune-games-sdk/multiplayer";
import iconPlaceholder from "./assets/placeholder.png";


function App(): JSX.Element {
  const [game, setGame] = useState<GameState>();
  const [myPlayerId, setMyPlayerId] = useState<string | undefined>();
  const [playerList, setPlayerList] = useState<Array<Player>>([]);

  const [currentTask, setCurrentTask] = useState<TaskType>(TASK_TYPE_NONE);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, yourPlayerId, players }) => {
        // unused param: olgGame
        // unused param: action
        // unused param: event
        setMyPlayerId(yourPlayerId);
        setGame(newGame);
        // update players
        setPlayerList(Object.keys(players).sort().map(k => players[k]));
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  function handleClick() {}

  function handleShelfClick(e: React.MouseEvent | React.TouchEvent, i: number): void {
    e.stopPropagation();
    const shelf = game?.bookshelves[i];
    if (shelf == null) { return }
    if (shelf.sortingTasks.length === 0) { return }
    setCurrentTask(TASK_TYPE_BOOK_SORT_AUTHOR);
  }

  function handleCashierClick(e: React.MouseEvent | React.TouchEvent): void {
    e.stopPropagation();
    const n = game?.tasks.length;
    if (!n) { return }
    setCurrentTask(TASK_TYPE_BOOK_PURCHASE);
  }

  function cancelTask() {
    setCurrentTask(TASK_TYPE_NONE);
  }

  return (
    <>
      <HUD notifications={game.tasks} score={game.score} timer={game.timer} />

      <div className="bg-interface" onClick={cancelTask}>
        <BookShelf className={"bookshelf-one"} handleClick={e => handleShelfClick(e, 0)} />
        <BookShelf className={"bookshelf-two"} handleClick={e => handleShelfClick(e, 1)}/>
        <BookShelf className={"bookshelf-three"} handleClick={e => handleShelfClick(e, 2)}/>
        <BookPile className={"book-pile"} handleClick={handleClick} />
        <Cashier className={"cashier"} handleClick={handleCashierClick} />
        <Person className={"person"} handleClick={handleClick} />
        <Person2 className={"person"} handleClick={handleClick} />

        <footer>Images: Freepik.com</footer>
      </div>

      {
        currentTask != TASK_TYPE_NONE
        ? <ActionPanel game={game} taskType={currentTask} cancelTask={cancelTask} />
        : (
          <div className="player-list">
            { playerList.map(player => (
              <div className="player">
                <img src={iconPlaceholder} />
                <img className="avatar" src={player.avatarUrl} />
              </div>
            ))}
          </div>
        )
      }
    </>
  );
}

export default App;
