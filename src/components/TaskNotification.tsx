import "./TaskNotification.css";

// interface TaskNotificationProps {}

function TaskNotification(): JSX.Element {
  return (
    <div className="notification">
      <div className="icon"></div>
      <div className="progress-bar"></div>
    </div>
  );
}

export default TaskNotification;
