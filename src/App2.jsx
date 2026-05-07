import { AgGridReact } from "ag-grid-react";
import { useState, useMemo } from "react";

import MainContainer from "./components/MainContainer";
import tabs, { dataPromise } from "./utils/tabs";
import usePrevious from "./hooks/usePrevious";
import Dropdown from "./components/Dropdown";
import pivotTable from "./utils/pivotTable";
import usePromise from "./hooks/usePromise";

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

  return Object.fromEntries(
    Object.entries(store).map(([k, set]) => [k, new Set([...set].sort())]),
  );
};

// *total row
// *formatting numbers
// *right align numbers
// *formatting header names
// *grid props accessor?
// !if length of list is 0, don't show component/ui
// !filter state should be like faculty workload filter state
// !should be able to set initial filters
// ?should be able to control resetting behavior (how state resets between tabs)
// ?add column measuring logic
// ?performance issues

export default function App() {
  const [filters, setFilters] = useState();

  const [tabId, setTabId] = useState(tabs[0].id);

  const { initialStates, accessorFns, formatters } = useMemo(
    () => tabs.find((obj) => obj.id === tabId),
    [tabId],
  );

  const [pivotConfigState, setPivotConfig] = useState(
    initialStates.pivotConfig,
  );

  const pivotConfig = accessorFns.pivotConfig(pivotConfigState);

  const initPivotState = () => setPivotConfig(initialStates.pivotConfig);

  usePrevious(initialStates, initPivotState);

  const { column: pivotColumn, rows: pivotRows, agg: aggType } = pivotConfig;

  const originalData = usePromise(dataPromise);

  const data = useMemo(
    () => accessorFns.data(originalData),
    [accessorFns, originalData],
  );

  console.log(data);

  const initialFilters = useMemo(
    () => accessorFns.filterLists(getEveryValue(data)),
    [accessorFns, data],
  );

  usePrevious(initialFilters, () => setFilters(initialFilters));

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        for (const [k, v] of Object.entries(row)) {
          if (filters && k in filters && !filters[k].has(v)) {
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

  const rowData = pivotTable(filteredData, pivotConfig);

  const pinnedTopRowData = pivotTable(filteredData, {
    ...pivotConfig,
    rows: [],
  });

  const columnDefs = [...new Set(rowData.flatMap(Object.keys))].map(
    (field) => ({ field }),
  );

  const originalGridProps = { pinnedTopRowData, columnDefs, rowData };

  const gridProps = accessorFns.gridProps(originalGridProps, {
    filteredData,
    pivotConfig,
  });

  const updatePivotRows = (key) =>
    setPivotConfig((obj) => ({
      ...obj,
      rows: obj.rows.includes(key)
        ? obj.rows.filter((s) => s !== key)
        : [...obj.rows, key],
    }));

  const updatePivotColumn = (key) =>
    setPivotConfig((obj) => ({
      ...obj,
      column: obj.column === key ? null : key,
    }));

  const updateAggType = (key) =>
    setPivotConfig((obj) => ({
      ...obj,
      agg: obj.agg === key ? null : key,
    }));

  const keys = [...new Set(data.flatMap(Object.keys))];

  const pivotRowsList = accessorFns.lists.pivotRows(keys);

  const pivotColumnList = accessorFns.lists.pivotColumn(keys);

  const aggTypeList = accessorFns.lists.aggType([
    "sum",
    "avg",
    "min",
    "max",
    "count",
  ]);

  const pivotRowsDropdown = (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button {...api}>
          Pivot rows: {pivotRows.map(formatters.dataKey).join(", ")}
        </Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {pivotRowsList.map((key) => (
            <Dropdown.Item
              onClick={() => updatePivotRows(key)}
              active={pivotRows.includes(key)}
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
          {pivotColumnList.map((key) => (
            <Dropdown.Item
              onClick={() => updatePivotColumn(key)}
              active={pivotColumn === key}
              key={key}
            >
              {formatters.dataKey(key)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );

  const aggTypeDropdown = (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button {...api}>Agg type: {aggType}</Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {aggTypeList.map((key) => (
            <Dropdown.Item
              onClick={() => updateAggType(key)}
              active={aggType === key}
              key={key}
            >
              {key}
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
      renderButton={(api) => (
        <Dropdown.Button
          variant={areAllValuesActive(k) ? "secondary" : "warning"}
          className="w-100"
          {...api}
        >
          {formatters.dataKey(k)}
        </Dropdown.Button>
      )}
      className="flex-fill"
      key={k}
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
              key={v}
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
        {pivotRowsDropdown}
        {pivotColumnDropdown}
        {aggTypeDropdown}
      </SubContainer>
      <SubContainer className="d-flex flex-wrap gap-2">
        {filterableFields.map(renderDropdownFilter)}
      </SubContainer>
      <SubContainer>
        <div style={{ height: 500 }}>
          <AgGridReact {...gridProps}></AgGridReact>
        </div>
      </SubContainer>
    </MainContainer>
  );
}
