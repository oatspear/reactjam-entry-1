import { useEffect, useState } from "react";
import "./App.css";
import { GameState, TASK_TYPE_BOOK_PURCHASE, TASK_TYPE_BOOK_SORT_AUTHOR, Task } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BookShelf from "./components/interface/Bookshelf.tsx";
import Cashier from "./components/interface/Cashier.tsx";
import ActionPanel from "./components/actions/ActionPanel.tsx";
import { Player } from "rune-games-sdk/multiplayer";
import iconPlaceholder from "./assets/placeholder.png";
import { playSound } from "./sounds.ts";


function App(): JSX.Element {
  const [game, setGame] = useState<GameState>();
  // const [myPlayerId, setMyPlayerId] = useState<string | undefined>();
  const [playerList, setPlayerList] = useState<Array<Player>>([]);

  const [currentTask, setCurrentTask] = useState<Task | undefined>();
  const [taskArgument, setTaskArgument] = useState<number>(0);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, oldGame, players }) => {
        // unused param: action
        // unused param: event
        // unused param: yourPlayerId
        // setMyPlayerId(yourPlayerId);
        setGame(newGame);
        // update players
        setPlayerList(Object.keys(players).sort().map(k => players[k]));
        // check for score
        if (newGame.score > oldGame.score) {
          playSound("score");
        } else {
          if (newGame.tasks.length < oldGame.tasks.length) {
            playSound("fail");
          } else {
            if (newGame.tasks.length > 0 && oldGame.tasks.length > 0) {
              if (newGame.tasks[0].id != oldGame.tasks[0].id) {
                playSound("fail");
              }
            }
          }
        }
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  function handleShelfClick(e: React.MouseEvent | React.TouchEvent, g: number): void {
    e.stopPropagation();
    if (game == null) { return }
    const shelf = game.bookshelves[g];
    if (shelf == null) { return }
    const n = game.tasks.length;
    for (let i = n-1; i >= 0; --i) {
      const task = game.tasks[i];
      if (task.type === TASK_TYPE_BOOK_SORT_AUTHOR) {
        setCurrentTask(task);
        setTaskArgument(g);
        return;
      }
    }
  }

  function handleCashierClick(e: React.MouseEvent | React.TouchEvent): void {
    e.stopPropagation();
    if (game == null) { return }
    const n = game.tasks.length;
    for (let i = n-1; i >= 0; --i) {
      const task = game.tasks[i];
      if (task.type === TASK_TYPE_BOOK_PURCHASE) {
        setCurrentTask(task);
        return;
      }
    }
  }

  function cancelTask() {
    setCurrentTask(undefined);
  }

  return (
    <>
      <HUD notifications={game.tasks} score={game.score} timer={game.timer} />

      <div className="bg-interface" onClick={cancelTask}>
        <div className="playable-area">
          <BookShelf person={1} handleClick={e => handleShelfClick(e, 0)} />
          <BookShelf person={0} handleClick={e => handleShelfClick(e, 1)}/>
          <BookShelf person={2} handleClick={e => handleShelfClick(e, 2)}/>
          <Cashier handleClick={handleCashierClick} />
        </div>

        <footer>Images: Freepik.com; Sounds: Envato Elements</footer>
      </div>

      {
        currentTask != null
        ? <ActionPanel game={game} taskType={currentTask.type} cancelTask={cancelTask} arg1={taskArgument} />
        : (
          <div className="player-list">
            { playerList.map(player => (
              <div className="player" key={player.playerId}>
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
