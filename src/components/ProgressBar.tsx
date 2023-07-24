import "./ProgressBar.css";

interface ProgressBarProps {
  value: number;
  maximum: number;
}

const ProgressBar = ({ value, maximum }: ProgressBarProps): JSX.Element => {
  const percent = value * 100.0 / maximum;
  const fillerStyles = {
    width: `${percent}%`,
    backgroundColor: percent > 60 ? "green" : (percent > 30 ? "yellow" : "red"),
  };

  return (
    <div className="progress-bar">
      <div className="filler" style={fillerStyles}></div>
    </div>
  );
};

export default ProgressBar;
