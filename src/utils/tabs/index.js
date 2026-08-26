import { dataPromise, jsonDataPromise } from "./data";
import concentrationTab from "./concentrations";
import minorTab from "./minors";
import retentionTab from "./retention";

const tabs = dataPromise === jsonDataPromise
  ? [minorTab, concentrationTab]
  : [retentionTab];

export default tabs;
