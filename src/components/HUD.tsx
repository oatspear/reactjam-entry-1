import "./HUD.css";
import IconLabel from "./IconLabel";
import TaskNotification from "./TaskNotification";
import "animate.css";
import { AnimatePresence } from "framer-motion";
import { GAME_TIME_SECONDS, TASK_TYPE_BOOK_PURCHASE, TASK_TYPE_BOOK_SORT_AUTHOR, Task } from "../logic";
import iconScore from "../assets/score.png";
import iconClock from "../assets/clock.png";
import iconBag from "../assets/bag.png";
import iconBooks from "../assets/books.png";

function secsToLabel(totalSeconds: number): string {
  const mins = (totalSeconds / 60) | 0;
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}


interface HUDProps {
  notifications: Array<Task>;
  score: number;
  timer: number;
}


function HUD({notifications, score, timer}: HUDProps): JSX.Element {
  const now = GAME_TIME_SECONDS - timer;

  return (
    <div className="hud">
      <div className="top-bar">
        <IconLabel icon={iconScore} label={score.toString()}></IconLabel>
        <IconLabel icon={iconClock} label={secsToLabel(timer)}></IconLabel>
      </div>
      <div className="task-notifications">
      <AnimatePresence>
        {
          notifications.map(task => {
            const timeout = task.endsAt - task.createdAt;
            const elapsed = now - task.createdAt;
            let ico = iconScore;
            switch (task.type) {
              case TASK_TYPE_BOOK_PURCHASE:
                ico = iconBag;
                break;
              case TASK_TYPE_BOOK_SORT_AUTHOR:
                ico = iconBooks;
                break;
            }
            return <TaskNotification key={task.id} type={ico} timeout={timeout} elapsed={elapsed} />
          })
        }
        </AnimatePresence>
        </div>
    </div>
  );
}

export default HUD;
