import { useState, useEffect, useRef } from "react";
import { getContrastyColor } from "../../../helpers/colorHelper";
import "../styles/desktop.scss";
import "../styles/mobile.scss";

type TagProps = {
  text: string;
  selectable: boolean;
  onSelectHandler?: (text: string, selected: boolean) => void;
  bgColor?: string;
};

const Tag = ({ text, selectable, onSelectHandler, bgColor }: TagProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [selectableTagContainerClass, setSelectableTagContainerClass] = useState<string>("");
  const prevIsSelected = useRef(isSelected);

  const getTagBgColor = () => {
    return !selectable ? bgColor : undefined;
  };
  const selectableStyle = {
    background: getTagBgColor(),
    boxShadow: selectable && !isSelected ? "0 0 3px black" : "none",
  };

  const getTagContainerClass = () => {
    if (selectable) {
      setSelectableTagContainerClass(
        !isSelected ? "tag-container__selectable-selected" : "tag-container__selectable-unselected"
      );
    }
  };
  const onSelect = () => {
    getTagContainerClass();
    setIsSelected((prevState) => {
      // use the previous state value to calculate the new one
      const newState = !prevState;
   
      // return the new state value
      return newState;
    });
  };

  useEffect(() => {
    // Only call the onSelectHandler function if the isSelected state has changed from the previous value
    if (onSelectHandler && isSelected !== prevIsSelected.current) {
        onSelectHandler(text, isSelected);
      }
      // Update the prevIsSelected value with the current value
      prevIsSelected.current = isSelected;
    }, [isSelected]);

  return (
    <div className={`tag-container ${selectableTagContainerClass}`} style={selectableStyle}>
      <span
        className="tag-container__text"
        onClick={onSelectHandler !== undefined ? () => onSelect() : undefined}
        style={{ color: getContrastyColor(bgColor) }}
      >
        {text}
      </span>
    </div>
  );
};

export default Tag;
