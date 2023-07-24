import React, { useEffect, useState } from "react";
import "./TaskNotification.css";
import ProgressBar from "./ProgressBar";

interface TaskNotificationProps {
  type: string;
  timer: number;
}

function TaskNotification({type, timer}: TaskNotificationProps): JSX.Element {
  const [maxTime, setMaxTime] = useState(timer);

  useEffect(() => {
    setMaxTime(timer);
  }, []);  // Empty dependencies (runs only once)

  // const nodeRef = useRef(null);

  return (
    <div className="notification">
      <div className="icon">{type}</div>
      <ProgressBar value={timer} maximum={maxTime}></ProgressBar>
    </div>
  );
}

export default TaskNotification;
