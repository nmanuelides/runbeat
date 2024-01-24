import React from "react";
import '../styles/desktop.scss';
import '../styles/mobile.scss';

type ToggleProps = {
    state?: boolean;
    title?: string;
}

const Toggle = ({state=false, title}: ToggleProps): JSX.Element => {

    return (
        <div className="toggle-container">
        {title && <span>{title}</span>}
        <input type="checkbox" className="toggle-switch"/>
        </div>
    )
}   

export default Toggle;