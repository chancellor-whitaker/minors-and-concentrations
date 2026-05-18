import { useState, useMemo } from "react";
import { csv } from "d3-fetch";

import MainContainer from "./components/MainContainer";
import Dropdown from "./components/Dropdown";
import usePromise from "./hooks/usePromise";
// import { dataPromise } from "./utils/tabs";
import App2 from "./App2";
const { SubContainer } = MainContainer;

const fileListPromise = csv("data/retention/_fileList.csv");

const getDataPromise = (file) => {
  const arr = file.filename.split("\\");

  return csv(`data/retention/${arr[arr.length - 1]}`);
};

export default function App() {
  const fileList = usePromise(fileListPromise);

  const [filename, setFilename] = useState();

  if (!filename && Array.isArray(fileList) && fileList.length > 0) {
    const defaultFile = fileList.find(
      ({ default_page }) => default_page === "Y",
    );

    if (defaultFile) {
      setFilename(defaultFile.filename);
    } else {
      setFilename(fileList[0].filename);
    }
  }

  const filePromise = useMemo(
    () =>
      filename
        ? getDataPromise(fileList.find((x) => x.filename === filename))
        : null,
    [fileList, filename],
  );

  const data = usePromise(filePromise);

  //   console.log(fileList);

  const activeFile = Array.isArray(fileList)
    ? fileList.find((x) => x.filename === filename)
    : null;

  const getFileLabel = (x) => (x ? `${x.term_desc} (${x.asOfDate_str})` : null);

  const fileDropdown = (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button {...api}>{getFileLabel(activeFile)}</Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {[fileList]
            .filter(Boolean)
            .flat()
            .map((x) => (
              <Dropdown.Item
                onClick={() => setFilename(x.filename)}
                active={filename === x.filename}
              >
                {getFileLabel(x)}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );

  return (
    <>
      <App2
        footnote={<i>* This is based on official enrollment numbers.</i>}
        data={data}
      >
        {fileDropdown}
      </App2>
    </>
  );
}
