import { useDeferredValue, useMemo, useState } from "react";
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

// filter lists
// formatters: { dataKey: fn, dataValue: fn }

const getEveryValue = (data) => {
  const store = {};

  [data]
    .filter(Boolean)
    .flat()
    .forEach((row) =>
      Object.entries(row).forEach(([key, value]) => {
        if (!(key in store)) store[key] = new Set();

        store[key].add(value);
      }),
    );

  return store;
};

export default function App() {
  const [filters, setFilters] = useState();

  const [tabId, setTabId] = useState(tabs[0].id);

  const tab = tabs.find((obj) => obj.id === tabId);

  const { accessorFns, initialStates, formatters } = tab;

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

  const data = useMemo(
    () => accessorFns.data(originalData),
    [accessorFns, originalData],
  );

  const initialFilters = useMemo(
    () => accessorFns.filterLists(getEveryValue(data)),
    [accessorFns, data],
  );

  usePrevious(initialFilters, () => setFilters(initialFilters));

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        for (const [k, v] of Object.entries(row)) {
          if (!(filters && k in filters && filters[k].has(v))) {
            return false;
          }
        }

        return true;
      }),
    [data, filters],
  );

  const updateFilters = (a) =>
    setFilters((state) =>
      Object.fromEntries(
        Object.entries(state).map((entry) =>
          entry[0] !== a[0]
            ? entry
            : [
                a[0],
                a.length === 1
                  ? entry[1].size === initialFilters[a[0]].size
                    ? new Set()
                    : new Set(initialFilters[a[0]])
                  : entry[1].has(a[1])
                    ? new Set([...entry[1]].filter((s) => s !== a[1]))
                    : new Set([...entry[1], a[1]]),
              ],
        ),
      ),
    );

  const areAllValuesActive = (k) =>
    filters && k in filters && filters[k].size === initialFilters[k].size;

  const isValueActive = (a) =>
    a.length === 1
      ? areAllValuesActive(a[0])
      : filters && a[0] in filters && filters[a[0]].has(a[1]);

  console.log(filters);

  const rowData = pivotCountTable(filteredData, {
    rows: pivotRow,
    column: pivotColumn,
  });

  const originalColumnDefs = [...new Set(rowData.flatMap(Object.keys))].map(
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

  const pivotRowDropdown = (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button {...api}>
          Pivot rows: {pivotRow.map(formatters.dataKey).join(", ")}
        </Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {pivotRowOptions.map((key) => (
            <Dropdown.Item
              onClick={() => updatePivotRow(key)}
              active={pivotRow.includes(key)}
            >
              {formatters.dataKey(key)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );

  const pivotColumnDropdown = (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button {...api}>
          Pivot column: {formatters.dataKey(pivotColumn)}
        </Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {pivotColumnOptions.map((key) => (
            <Dropdown.Item
              onClick={() => setPivotColumn((s) => (s === key ? null : key))}
              active={pivotColumn === key}
            >
              {formatters.dataKey(key)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );

  const tabSwitcher = (
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
  );

  const filterableFields = Object.keys(initialFilters);

  const renderDropdownFilter = (k) => (
    <Dropdown
      className="flex-fill"
      renderButton={(api) => (
        <Dropdown.Button
          variant={areAllValuesActive(k) ? "secondary" : "warning"}
          className="w-100"
          {...api}
        >
          {formatters.dataKey(k)}
        </Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          <Dropdown.Item
            onClick={() => updateFilters([k])}
            active={isValueActive([k])}
          >
            All
          </Dropdown.Item>
          {(initialFilters && k in initialFilters
            ? [...initialFilters[k]]
            : []
          ).map((v) => (
            <Dropdown.Item
              onClick={() => updateFilters([k, v])}
              active={isValueActive([k, v])}
            >
              {formatters.dataValue([k, v])}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );

  return (
    <MainContainer>
      <SubContainer>{tabSwitcher}</SubContainer>
      <SubContainer className="d-flex flex-wrap gap-2">
        {pivotRowDropdown}
        {pivotColumnDropdown}
      </SubContainer>
      <SubContainer className="d-flex flex-wrap gap-2">
        {filterableFields.map(renderDropdownFilter)}
      </SubContainer>
      <SubContainer>
        <div style={{ height: 500 }}>
          <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
        </div>
      </SubContainer>
    </MainContainer>
  );
}
