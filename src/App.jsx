import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { csv } from "d3-fetch";

import MainContainer from "./components/MainContainer";
import usePromise from "./hooks/usePromise";

const { SubContainer } = MainContainer;

// semester, score, not retained, retained, total

export default function App() {
  const datasets = usePromise(allPromises);

  const tabularDatasets = useMemo(
    () => makeDatasetsTabular(datasets),
    [datasets],
  );

  return (
    <MainContainer>
      {[tabularDatasets]
        .filter(Boolean)
        .flat()
        .map((tabularData, index) => (
          <SubContainer key={index}>
            <div style={{ height: 500 }}>
              <AgGridReact {...tabularData}></AgGridReact>
            </div>
          </SubContainer>
        ))}
    </MainContainer>
  );
}

const seasons = ["Summer", "Fall", "Winter", "Spring"];

const allPromises = Promise.all(
  seasons.map((season) => csv(`data/${season}.csv`)),
);

const groupKeys = ["prediction_score", "prediction_class"];

const currentYear = new Date().getFullYear();

const getColumnDefs = (rowData) =>
  [...new Set(rowData.map(Object.keys).flat())].map((field) => ({ field }));

const groupDataByKey = (data, key) => {
  const store = {};

  const rows = [data].filter(Boolean).flat();

  rows.forEach((row) => {
    const value = row[key];

    if (!(value in store)) store[value] = [];

    store[value].push(row);
  });

  return store;
};

const makeDatasetsTabular = (datasets) =>
  [datasets]
    .filter(Boolean)
    .flat()
    .map((data, index) => {
      const semester = `${seasons[index]} ${currentYear}`;

      const groupedData = groupDataByKey(data, groupKeys[0]);

      const digit2Key = { 0: "notRetained", 1: "retained" };

      const scoredRows = Object.entries(groupedData).map(([value, rows]) =>
        Object.fromEntries([
          ["semester", semester],
          ["score", value],
          ...Object.entries(groupDataByKey(rows, groupKeys[1])).map(
            ([digit, array]) => [digit2Key[`${digit}`], array.length],
          ),
        ]),
      );

      const rowData = scoredRows.map((row) => {
        const notRetained = "notRetained" in row ? row.notRetained : 0;

        const retained = "retained" in row ? row.retained : 0;

        const total = notRetained + retained;

        return { ...row, notRetained, retained, total };
      });

      return { columnDefs: getColumnDefs(rowData), rowData };
    });
