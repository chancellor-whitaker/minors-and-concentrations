import { useMemo, useState } from "react";
import MainContainer from "./components/MainContainer";
import usePromise from "./hooks/usePromise";
import { AgGridReact } from "ag-grid-react";
import useData from "./hooks/useData";
import pivotCountTable from "./utils/pivotCountTable";
import tabs from "./utils/tabs";
import dataUrl from "./utils/dataUrl";
import usePrevious from "./hooks/usePrevious";
import Dropdown from "./components/Dropdown";

const { SubContainer } = MainContainer;

// initial states
// pivot state accessor

// pivot rows list

export default function App() {
  const [tabId, setTabId] = useState(tabs[0].id);

  const tab = tabs.find((obj) => obj.id === tabId);

  const { accessorFns, initialStates } = tab;

  const [pivotRowState, setPivotRow] = useState(initialStates.pivotRow);

  const [pivotColumnState, setPivotColumn] = useState(
    initialStates.pivotColumn,
  );

  const initPivotState = () => {
    setPivotRow(initialStates.pivotRow);

    setPivotColumn(initialStates.pivotColumn);
  };

  usePrevious(initialStates, initPivotState);

  const pivotRow = accessorFns.pivotRow(pivotRowState);

  const pivotColumn = accessorFns.pivotColumn(pivotColumnState);

  const originalData = useData(dataUrl);

  const data = accessorFns.data(originalData);

  const pivotedData = pivotCountTable(data, {
    rows: pivotRow,
    column: pivotColumn,
  });

  const originalColumnDefs = [...new Set(pivotedData.flatMap(Object.keys))].map(
    (field) => ({ field }),
  );

  const columnDefs = accessorFns.columnDefs(originalColumnDefs);

  const updatePivotRow = (key) =>
    setPivotRow((arr) =>
      arr.includes(key) ? arr.filter((s) => s !== key) : [...arr, key],
    );

  const keys = [...new Set(data.flatMap(Object.keys))];

  const pivotRowOptions = accessorFns.pivotRowOptions(keys);

  const pivotColumnOptions = accessorFns.pivotColumnOptions(keys);

  return (
    <MainContainer>
      <SubContainer>
        <Dropdown>Chancellor</Dropdown>
      </SubContainer>
      <SubContainer>
        <div>
          <div className="btn-group" role="group">
            {tabs.map((obj) => (
              <button
                className={["btn btn-primary", obj.id === tabId && "active"]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setTabId(obj.id)}
                type="button"
                key={obj.id}
              >
                {obj.label}
              </button>
            ))}
          </div>
        </div>
      </SubContainer>
      <SubContainer className="d-flex flex-wrap gap-3">
        <div className="d-flex flex-column gap-2 flex-fill">
          Pivot rows: {pivotRow.join(", ")}
          <ul className="list-group overflow-y-scroll" style={{ height: 245 }}>
            {pivotRowOptions.map((key) => (
              <li
                onClick={() => updatePivotRow(key)}
                className={[
                  "list-group-item",
                  pivotRow.includes(key) && "active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={key}
              >
                {key}
              </li>
            ))}
          </ul>
        </div>
        <div className="d-flex flex-column gap-2 flex-fill">
          Pivot column: {pivotColumn}
          <ul className="list-group overflow-y-scroll" style={{ height: 245 }}>
            {pivotColumnOptions.map((key) => (
              <li
                key={key}
                onClick={() => setPivotColumn((s) => (s === key ? null : key))}
                className={["list-group-item", pivotColumn === key && "active"]
                  .filter(Boolean)
                  .join(" ")}
              >
                {key}
              </li>
            ))}
          </ul>
        </div>
      </SubContainer>
      <SubContainer>
        <div style={{ height: 500 }}>
          <AgGridReact
            rowData={pivotedData}
            columnDefs={columnDefs}
          ></AgGridReact>
        </div>
      </SubContainer>
    </MainContainer>
  );
}
