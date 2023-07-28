import BookShelf from "./interface/Bookshelf"; 
import Cashier from "./interface/Cashier";
import "./BgInterface.css";
import { GameState, Task } from "../logic";


interface BgInterfaceProps {
  game: GameState;
  setCurrentTask: (task: Task) => void;
}


function BgInterface({ game, setCurrentTask }: BgInterfaceProps): JSX.Element {

  function handleShelfClick(i: number): void {
    const shelf = game.bookshelves[i];
    if (shelf == null) { return }
    if (shelf.sortingTasks.length === 0) { return }
    setCurrentTask(shelf.sortingTasks[0]);
  }

  function handleCashierClick(): void {
    if (game.tasks.length === 0) { return }
    setCurrentTask(game.tasks[0]);
  }

  return (
    <div className="bg-interface">
      <BookShelf className={"bookshelf-one"} handleClick={() => handleShelfClick(0)} />
      <BookShelf className={"bookshelf-two"} handleClick={() => handleShelfClick(1)}/>
      <BookShelf className={"bookshelf-three"} handleClick={() => handleShelfClick(2)}/>
      <Cashier className={"cashier"} handleClick={handleCashierClick} />
    </div>
  )
}


export default BgInterface;
