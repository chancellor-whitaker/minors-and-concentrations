import MainContainer from "./components/MainContainer";
import Dropdown from "./components/Dropdown";
import Content from "./Content";
const { SubContainer } = MainContainer;

// *2 dropdowns for file list
// *set grs to official grs (ft bach seeking) by default
// *footnote on minors (not retention)
// !try query param thing (per term & date)

// * right align col group headers
// ! query param stuff

export default function App() {
  return (
    <>
      <Content
        footnote={<i>* This is based on official enrollment numbers.</i>}
      ></Content>
    </>
  );
}
