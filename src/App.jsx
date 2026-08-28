import { useRemoteComponent } from "./remote";
import Content from "./Content";

// *2 dropdowns for file list
// *set grs to official grs (ft bach seeking) by default
// *footnote on minors (not retention)
// !try query param thing (per term & date)

// * right align col group headers
// ! query param stuff

export default function App() {
  const Wrapper = useRemoteComponent();

  return (
    <Wrapper>
      <Content
        footnote={<i>* This is based on official enrollment numbers.</i>}
      ></Content>
    </Wrapper>
  );
}
