import "./TaskNotification.css";
import ProgressBar from "./ProgressBar";
import { motion } from "framer-motion";

interface TaskNotificationProps {
  type: string;
  timeout: number;
  elapsed: number;
}

function TaskNotification({type, timeout, elapsed}: TaskNotificationProps): JSX.Element {
  // const [maxTime, setMaxTime] = useState(timer);

  // useEffect(() => {
  //   setMaxTime(timer);
  // }, []);  // Empty dependencies (runs only once)

  // const nodeRef = useRef(null);

  const timer = timeout - elapsed;

  return (
    <motion.div className="notification"
      initial={{ x: "0", opacity: 0 }}
      animate={{ x: "20px", opacity: 1 }}
      exit={{
        y: "-100px",
        opacity: 0,
        transition: { delay: 0.1, duration: 0.1 }
      }}
      transition={{ delay: 0.1 }}
      >
      <img className="icon" src={type} />
      <ProgressBar value={timer} maximum={timeout}></ProgressBar>
    </motion.div>
  );
}

export default TaskNotification;
