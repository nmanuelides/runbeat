import React from "react";
import "../styles/desktop.scss";
import "../styles/mobile.scss";

type ToggleProps = {
  state?: boolean;
  title?: string;
  type: 'speed' | 'height';
};

const Toggle = ({ state = false, title, type }: ToggleProps): JSX.Element => {
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
      <input type="checkbox" className={`toggle-switch ${toggleClass()}`} />
    </div>
  );
};

export default Toggle;
