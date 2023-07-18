import "./IconLabel.css"

interface IconLabelProps {
  icon: string;
  label: string;
}

function IconLabel({icon, label}: IconLabelProps): JSX.Element {
  return (
    <div className="icon-label">
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </div>
  );
}

export default IconLabel;