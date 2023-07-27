import React, { createRef, useRef } from "react";
import "./HUD.css";
import IconLabel from "./IconLabel";
import TaskNotification from "./TaskNotification";
import "animate.css";
import { AnimatePresence } from "framer-motion";
import { Task } from "../logic";

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

  return (
    <div className="hud">
      <div className="top-bar">
        <IconLabel icon="S" label={score.toString()}></IconLabel>
        <IconLabel icon="T" label={secsToLabel(timer)}></IconLabel>
      </div>
      <div className="task-notifications">
      <AnimatePresence>
        {
          notifications.map(task => {
          return <TaskNotification type="S" timer={task.timer} key={task.id}></TaskNotification>
          })
        }
        </AnimatePresence>
        </div>
    </div>
  );
}

export default HUD;
