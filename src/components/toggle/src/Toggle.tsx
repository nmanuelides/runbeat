import React from "react";
import "../styles/desktop.scss";
import "../styles/mobile.scss";

export type ToggleType = 'speed' | 'height';
type ToggleProps = {
  state?: boolean;
  title?: string;
  type: ToggleType;
  handleToggle: (type: ToggleType, e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Toggle = ({ state = false, title, type, handleToggle }: ToggleProps): JSX.Element => {
 function toggleClass() {
    switch (type) {
        case 'speed':
            return 'speed-toggle';
        case 'height':
            return 'height-toggle';
        default:
            return '';
    }
 }
  return (
    <div className="toggle-container">
      {title && <span>{title}</span>}
      <input type="checkbox" className={`toggle-switch ${toggleClass()}`} onChange={(e) => {handleToggle(type, e)}} />
    </div>
  );
};

export default Toggle;
