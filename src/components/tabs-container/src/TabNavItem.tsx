import "../styles/desktop.scss";

type TabNavItemProps = {
  id: string;
  title: string;
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabNavItem = ({ id, title, activeTab, setActiveTab }: TabNavItemProps): JSX.Element => {
  const handleClick = () => {
    setActiveTab(id);
  };

  return (
    <li onClick={handleClick} className={activeTab === id ? "active" : ""}>
      {title}
    </li>
  );
};

export default TabNavItem;
