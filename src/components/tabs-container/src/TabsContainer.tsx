import { useState } from "react";
import TabNavItem from "./TabNavItem";
import TabContent from "./TabContent";
import "../styles/desktop.scss";
import Search from "../../search/src/Search";
import AutoSuggest from "../../auto-suggest/src/AutoSuggest";

const TabsContainer = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>("tab1");
  return (
    <div className="tabs">
      <ul className="navItems">
        <TabNavItem title="Auto Suggest" id="tab1" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabNavItem title="Song Name" id="tab2" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabNavItem title="BPM" id="tab3" activeTab={activeTab} setActiveTab={setActiveTab} />
      </ul>

      <div className="tabsContentContainer">
        <TabContent id="tab1" activeTab={activeTab}>
          <AutoSuggest />
        </TabContent>
        <TabContent id="tab2" activeTab={activeTab}>
          <Search isSongNameSearch />
        </TabContent>
        <TabContent id="tab3" activeTab={activeTab}>
          <Search isSongNameSearch={false} />
        </TabContent>
      </div>
    </div>
  );
};

export default TabsContainer;
