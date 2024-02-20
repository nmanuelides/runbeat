import "../styles/desktop.scss";

type TabContentProps = {
  id: string;
  activeTab: string;
  children: React.ReactNode;
};

const TabContent = ({ id, activeTab, children }: TabContentProps): JSX.Element | null => {
  return activeTab === id ? <div className={"tabContent"}>{children} </div> : null;
};

export default TabContent;
