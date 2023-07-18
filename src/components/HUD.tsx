import "./HUD.css";
import IconLabel from "./IconLabel";
import TaskNotification from "./TaskNotification";

// interface HUDProps {}

function HUD(): JSX.Element {
  return (
    <div className="hud">
      <div className="top-bar">
        <IconLabel icon="S" label="0"></IconLabel>
        <IconLabel icon="T" label="5:00"></IconLabel>
      </div>
      <div className="notifications">
        <TaskNotification></TaskNotification>
        <TaskNotification></TaskNotification>
      </div>
    </div>
  );
}

export default HUD;
