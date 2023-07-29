// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import "./ActionPanel.css";
import iconCancel from "../../assets/cancel.png";
import { BookGenre, GameState, NUM_BOOKS_PER_PURCHASE, TASK_TYPE_BOOK_PURCHASE, TASK_TYPE_BOOK_SORT_AUTHOR, TaskType } from "../../logic";
import SellBooks from "./SellBooks";
import SortByAuthor from "./SortByAuthor";


// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------


function handleBookPurchase(game: GameState, cancelTask: () => void): JSX.Element {
  const tasks = game.tasks.filter(task => task.type === TASK_TYPE_BOOK_PURCHASE);
  if (tasks.length === 0) {
    return (
      <div onClick={cancelTask}>
        <h1>Time&apos;s Up!</h1>
      </div>
    )
  }

  return <SellBooks amount={NUM_BOOKS_PER_PURCHASE} cancelTask={cancelTask} />
}


function handleSortByAuthor(game: GameState, i: number, cancelTask: () => void): JSX.Element {
  const shelf = game.bookshelves[i];
  // if (!shelf.sortingTasks.length) {
  //   return (
  //     <div onClick={cancelTask}>
  //       <h1>All done!</h1>
  //     </div>
  //   )
  // }

  const genre: BookGenre = shelf.genre;
  const authors: string[] = shelf.sorting;
  return <SortByAuthor genre={genre} authors={authors} cancelTask={cancelTask} />
}



// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------


interface ActionPanelProps {
  game: GameState;
  taskType: TaskType;
  arg1: number;
  cancelTask: () => void;
}


function ActionPanel({ game, taskType, arg1, cancelTask }: ActionPanelProps): JSX.Element {
  // const [success, setSuccess] = useState<boolean>(false);

  return (
    <div className="action-panel">
      <div className="button-holder">
        <button className="cancel" onClick={cancelTask}>
          <img src={iconCancel} alt="Cancel" />
        </button>
      </div>

      {
        taskType === TASK_TYPE_BOOK_PURCHASE
        ? handleBookPurchase(game, cancelTask)
        : taskType === TASK_TYPE_BOOK_SORT_AUTHOR
        ? handleSortByAuthor(game, arg1, cancelTask)
        : `Handling task of type ${taskType}`
      }
    </div>
  );
}


export default ActionPanel;
