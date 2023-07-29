// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import "./ActionPanel.css";
import iconCancel from "../../assets/cancel.png";
import { TASK_TYPE_BOOK_PURCHASE, TaskType } from "../../logic";
import { GameState } from "rune-games-sdk/multiplayer";
import SellBooks from "./SellBooks";


// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------


function handleBookPurchase(game: GameState, cancelTask: () => void): JSX.Element {
  if (game.tasks.length === 0) {
    return (
      <div onClick={cancelTask}>
        <h1>Time's Up!</h1>
      </div>
    )
  }

  const amount = game.tasks[0].amount;
  return <SellBooks amount={amount} cancelTask={cancelTask} />
}



// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------


interface ActionPanelProps {
  game: GameState;
  taskType: TaskType;
  cancelTask: () => void;
}


function ActionPanel({ game, taskType, cancelTask }: ActionPanelProps): JSX.Element {
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
        : `Handling task of type ${taskType}`
      }
    </div>
  );
}


export default ActionPanel;
