import { useState, useMemo } from "react";
import { csv } from "d3-fetch";

import updateQueryParam from "./utils/updateQueryParam";
// import deleteQueryParam from "./utils/deleteQueryParam";
import MainContainer from "./components/MainContainer";
import usePrevious from "./hooks/usePrevious";
import Dropdown from "./components/Dropdown";
import usePromise from "./hooks/usePromise";
// import { dataPromise } from "./utils/tabs";
import App2 from "./App2";
const { SubContainer } = MainContainer;

const fileListPromise = csv("data/retention/_fileList.csv");

const createDataPromiseFn = (file) => {
  const arr = file.filename.split("\\");

  return csv(`data/retention/${arr[arr.length - 1]}`);
};

// *2 dropdowns for file list
// !set grs to official grs (ft bach seeking) by default
// !footnote on minors (not retention)
// !try query param thing (per term & date)

const useFileList = ({
  findDefaultPage = (x) => x.default_page === "Y",
  createDataPromise = createDataPromiseFn,
  promise = fileListPromise,
  dateKey = "asOfDate_str",
  termKey = "term_desc",
  initialTerm,
  initialDate,
}) => {
  const fileList = usePromise(promise);

  const isLengthyArray = (x) => Array.isArray(x) && x.length > 0;

  const [term, setTerm] = useState(initialTerm);

  const [date, setDate] = useState(initialDate);

  const terms = isLengthyArray(fileList)
    ? [...new Set(fileList.map((x) => x[termKey]))]
    : [];

  const getDates = (term) => [
    ...new Set(
      fileList.filter((x) => x[termKey] === term).map((x) => x[dateKey]),
    ),
  ];

  const dates = term && isLengthyArray(fileList) ? getDates(term) : [];

  const handleTermChanged = (t) => {
    if (t !== term) {
      setTerm(t);

      const newDates = getDates(t);

      if (!newDates.includes(date)) setDate(newDates[0]);
    }
  };

  const shouldInit = isLengthyArray(fileList) && !term && !date;

  if (shouldInit) {
    const defaultFile = fileList.find(findDefaultPage);

    const file = defaultFile ? defaultFile : fileList[0];

    setTerm(file[termKey]);

    setDate(file[dateKey]);
  }

  const activeFile = useMemo(
    () =>
      term && date && isLengthyArray(fileList)
        ? fileList.find((x) => x[termKey] === term && x[dateKey] === date)
        : null,
    [term, date, fileList, termKey, dateKey],
  );

  const dPromise = useMemo(
    () => (activeFile ? createDataPromise(activeFile) : null),
    [activeFile, createDataPromise],
  );

  const data = usePromise(dPromise);

  return {
    setTerm: handleTermChanged,
    activeFile,
    setDate,
    terms,
    dates,
    data,
    term,
    date,
  };
};

// Example URL: https://example.com
const urlParams = new URLSearchParams(window.location.search);

// Get a specific value
const initialTerm = urlParams.get("term"); // "123"
const initialDate = urlParams.get("date"); // "shoes"

export default function App() {
  const { setDate, setTerm, dates, terms, data, term, date } = useFileList({
    promise: fileListPromise,
    // initialTerm,
    // initialDate,
  });

  const updateParams = () => {
    updateQueryParam("date", date);
    updateQueryParam("term", term);
  };

  usePrevious(date, updateParams);

  usePrevious(term, updateParams);

  const emptyQueryParams = () =>
    window.history.replaceState({}, document.title, window.location.pathname);

  const termDropdown = (
    <Dropdown
      renderButton={(api) => <Dropdown.Button {...api}>{term}</Dropdown.Button>}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {terms.map((x) => (
            <Dropdown.Item
              onClick={() => {
                if (term !== x) {
                  emptyQueryParams();
                  setTerm(x);
                }
              }}
              active={term === x}
            >
              {x}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );

  const dateDropdown = (
    <Dropdown
      renderButton={(api) => <Dropdown.Button {...api}>{date}</Dropdown.Button>}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {dates.map((x) => (
            <Dropdown.Item
              onClick={() => {
                if (date !== x) {
                  emptyQueryParams();
                  setDate(x);
                }
              }}
              active={date === x}
            >
              {x}
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
        {termDropdown}
        {dateDropdown}
      </App2>
    </>
  );
}
