import React, { createRef } from "react";
import "./HUD.css";
import IconLabel from "./IconLabel";
import TaskNotification from "./TaskNotification";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import "animate.css";


function secsToLabel(totalSeconds: number): string {
  const mins = (totalSeconds / 60) | 0;
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}


interface HUDProps {
  notifications: Array<number>;
  score: number;
  timer: number;
}


function HUD({notifications, score, timer}: HUDProps): JSX.Element {
  const transitionClasses = {
    appear: "animate__animated",
    appearActive: "animate__backInRight",
    enter: "animate__animated",
    enterActive: "animate__backInRight",
    exit: "animate__animated",
    exitActive: "animate__bounceOutDown"
  };

  return (
    <div className="hud">
      <div className="top-bar">
        <IconLabel icon="S" label={score.toString()}></IconLabel>
        <IconLabel icon="T" label={secsToLabel(timer)}></IconLabel>
      </div>
      <TransitionGroup className="notifications" appear={true}>
        {
          notifications.map((secs, i) =>
            <CSSTransition
              key={i}
              timeout={250}
              classNames={transitionClasses}
            >
              <TaskNotification type="S" timer={secs}></TaskNotification>
            </CSSTransition>
          )
        }
      </TransitionGroup>
    </div>
  );
}

export default HUD;
