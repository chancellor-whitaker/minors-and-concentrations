import { useEffect, useMemo, useRef, useState } from "react";
import { themeBalham } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import MainContainer from "./components/MainContainer";
import usePrevious from "./hooks/usePrevious";
import Dropdown from "./components/Dropdown";
import usePromise from "./hooks/usePromise";
import pivotTable, { normalizeAggConfig } from "./utils/pivotTable";
import tabs from "./utils/tabs";
import { useRemoteComponent } from "./remote";

const { SubContainer } = MainContainer;

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
// *if length of list is 0, don't show component/ui
// *remove menu bar if lists are empty
// *download button
// *template (wrapper)
// *size columns to fit without truncating certain columns (might be buggy)
// ?is there an easier way to prevent filters from resetting when changing tabs?
// ?should be able to control resetting behavior (how state resets between tabs)
// ?add column measuring logic
// ?performance issues

// ?will eventually want degrees (could be split into 2 dashboards)

// *how to add % calculation?
// *add search to dropdowns
// ?would it be possible to have tabs be a js file appended to the window?
// ?responsive auto-sizing (based on dynamic width)
// *filter state uses the shared Wrapper dropdown-filter API
// *initial filters are preserved when filter lists reset
// *footnote that this is based on official enrollment numbers

// retention
// *file list
// ?query params (route per file)

// minors & conc
// ?minor college dropdown

// both
// ?performance
// *styling
// ?file organization
// *utilize shared Wrapper filter state

export default function App({ footnote, children }) {
  const Wrapper = useRemoteComponent();
  const { DropdownFilter, useDropdownFilters } = Wrapper.api.dropdownFilters;

  const [tabId, setTabId] = useState(tabs[0].id);

  const { initialStates, dataPromise, accessorFns, formatters } = useMemo(
    () => tabs.find((obj) => obj.id === tabId),
    [tabId],
  );

  const originalData = usePromise(dataPromise);

  const [pivotConfigState, setPivotConfig] = useState(
    initialStates.pivotConfig,
  );

  const pivotConfig = accessorFns.pivotConfig(pivotConfigState);

  const initPivotState = () => setPivotConfig(initialStates.pivotConfig);

  usePrevious(initialStates, initPivotState);

  const {
    column: pivotColumn,
    value: pivotValue,
    rows: pivotRows,
    agg: aggType,
  } = pivotConfig;

  const data = useMemo(
    () => accessorFns.data(originalData),
    [accessorFns, originalData],
  );

  const filterLists = useMemo(
    () => accessorFns.filterLists(getEveryValue(data)),
    [accessorFns, data],
  );

  const initialFilters = useMemo(() => {
    if (!("filters" in initialStates)) return filterLists;

    return Object.fromEntries(
      Object.entries(filterLists).map((entry) => {
        const [k, set] = entry;

        if (!(k in initialStates.filters)) return entry;

        return [k, new Set(initialStates.filters[k].filter((v) => set.has(v)))];
      }),
    );
  }, [filterLists, initialStates]);

  const availableValuesByField = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filterLists).map(([field, values]) => [
          field,
          [...values],
        ]),
      ),
    [filterLists],
  );

  const dropdownFilters = useDropdownFilters({ availableValuesByField });

  /*
   * The old local filter implementation reset selections whenever a tab/data
   * change produced a new filter list. Preserve that behavior while letting
   * the Wrapper own filter selection/history state.
   */
  useEffect(() => {
    for (const [field, checkedValues] of Object.entries(initialFilters)) {
      dropdownFilters.uncheckEverything(field);
      dropdownFilters.setValuesChecked({
        values: [...checkedValues],
        checked: true,
        field,
      });
    }
  }, [
    initialFilters,
    dropdownFilters.setValuesChecked,
    dropdownFilters.uncheckEverything,
  ]);

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        for (const [field, value] of Object.entries(row)) {
          if (
            field in availableValuesByField &&
            !dropdownFilters.isValueChecked({ field, value })
          ) {
            return false;
          }
        }

        return true;
      }),
    [
      data,
      availableValuesByField,
      dropdownFilters.filtersState,
      dropdownFilters.isValueChecked,
    ],
  );

  const [pivotEnabled] = useState(true);

  const rowData = !pivotEnabled
    ? filteredData
    : pivotTable(filteredData, pivotConfig);

  const pinnedTopRowData = !pivotEnabled
    ? []
    : pivotTable(filteredData, {
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

  const pivotValues = Array.isArray(pivotValue)
    ? pivotValue
    : pivotValue == null
      ? []
      : [pivotValue];

  const initialPivotValues = Array.isArray(initialStates.pivotConfig.value)
    ? initialStates.pivotConfig.value
    : initialStates.pivotConfig.value == null
      ? []
      : [initialStates.pivotConfig.value];

  const initialAggTypes = normalizeAggConfig(
    initialStates.pivotConfig.value,
    initialStates.pivotConfig.agg,
  );

  const getDefaultAggTypes = (valueField) => {
    const initialIndex = initialPivotValues.indexOf(valueField);

    return initialIndex >= 0 && initialAggTypes[initialIndex]?.length
      ? [...initialAggTypes[initialIndex]]
      : ["sum"];
  };

  const updatePivotValue = (key) =>
    setPivotConfig((obj) => {
      const currentValues = Array.isArray(obj.value)
        ? obj.value
        : obj.value == null
          ? []
          : [obj.value];
      const currentAggs = normalizeAggConfig(obj.value, obj.agg);
      const valueIndex = currentValues.indexOf(key);

      if (valueIndex >= 0) {
        return {
          ...obj,
          value: currentValues.filter((_, index) => index !== valueIndex),
          agg: currentAggs.filter((_, index) => index !== valueIndex),
        };
      }

      return {
        ...obj,
        value: [...currentValues, key],
        agg: [...currentAggs, getDefaultAggTypes(key)],
      };
    });

  const updateAggType = (valueIndex, key) =>
    setPivotConfig((obj) => {
      const currentAggs = normalizeAggConfig(obj.value, obj.agg);
      const nextAggs = currentAggs.map((aggTypes, index) => {
        if (index !== valueIndex) return aggTypes;

        return aggTypes.includes(key)
          ? aggTypes.filter((aggType) => aggType !== key)
          : [...aggTypes, key];
      });

      return {
        ...obj,
        agg: Array.isArray(obj.value) ? nextAggs : nextAggs[0],
      };
    });

  const keys = [...new Set(data.flatMap(Object.keys))];

  const pivotRowsList = accessorFns.lists.pivotRows(keys);

  const pivotColumnList = accessorFns.lists.pivotColumn(keys);

  const pivotValueList = accessorFns.lists.pivotValue(keys);

  const aggTypeList = accessorFns.lists.aggType([
    "sum",
    "avg",
    "min",
    "max",
    "count",
  ]);

  const pivotRowsDropdown = pivotRowsList.length > 0 && (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button
          disabled={!pivotRowsList.length > 0}
          toggle={pivotRowsList.length > 0}
          {...api}
        >
          Pivot rows: {pivotRows.map(formatters.dataKey).join(", ")}
        </Dropdown.Button>
      )}
    >
      {(api) =>
        pivotRowsList.length > 0 && (
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
        )
      }
    </Dropdown>
  );

  const pivotColumnDropdown = pivotColumnList.length > 0 && (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button
          disabled={!pivotColumnList.length > 0}
          toggle={pivotColumnList.length > 0}
          {...api}
        >
          Pivot column: {formatters.dataKey(pivotColumn)}
        </Dropdown.Button>
      )}
    >
      {(api) =>
        pivotColumnList.length > 0 && (
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
        )
      }
    </Dropdown>
  );

  const pivotValueDropdown = pivotValueList.length > 0 && (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button
          disabled={!pivotValueList.length > 0}
          toggle={pivotValueList.length > 0}
          {...api}
        >
          Value fields: {
            pivotValues.length
              ? pivotValues.map(formatters.dataKey).join(", ")
              : "None"
          }
        </Dropdown.Button>
      )}
    >
      {(api) =>
        pivotValueList.length > 0 && (
          <Dropdown.Menu {...api}>
            {pivotValueList.map((key) => (
              <Dropdown.Item
                onClick={() => updatePivotValue(key)}
                active={pivotValues.includes(key)}
                key={key}
              >
                {formatters.dataKey(key)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        )
      }
    </Dropdown>
  );

  const currentAggTypes = normalizeAggConfig(pivotValue, aggType);

  const aggTypeDropdowns =
    aggTypeList.length > 0
      ? pivotValues.map((valueField, valueIndex) => {
          const activeAggs = currentAggTypes[valueIndex];

          return (
            <Dropdown
              renderButton={(api) => (
                <Dropdown.Button
                  disabled={!aggTypeList.length > 0}
                  toggle={aggTypeList.length > 0}
                  {...api}
                >
                  Agg type ({formatters.dataKey(valueField)}): {
                    activeAggs.length ? activeAggs.join(", ") : "None"
                  }
                </Dropdown.Button>
              )}
              key={valueField}
            >
              {(api) =>
                aggTypeList.length > 0 && (
                  <Dropdown.Menu {...api}>
                    {aggTypeList.map((key) => (
                      <Dropdown.Item
                        onClick={() => updateAggType(valueIndex, key)}
                        active={activeAggs.includes(key)}
                        key={key}
                      >
                        {key}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )
              }
            </Dropdown>
          );
        })
      : [];

  const tabSwitcher = (
    <div>
      <div className="btn-group" role="group">
        {tabs.map((obj) => (
          <button
            className={[
              "btn btn-primary bg-gradient",
              obj.id === tabId && "active",
            ]
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

  const filterableFields = Object.keys(filterLists);

  const renderDropdownFilter = (field) => (
    <DropdownFilter
      availableValues={availableValuesByField[field] ?? []}
      formatValue={(value) => formatters.dataValue([field, value])}
      filters={dropdownFilters}
      label={formatters.dataKey(field)}
      className="d-grid flex-fill"
      field={field}
      key={`${tabId}:${field}`}
    />
  );

  const menuItems = [
    pivotRowsDropdown,
    pivotColumnDropdown,
    pivotValueDropdown,
    ...aggTypeDropdowns,
  ].filter(Boolean);

  const gridRef = useRef();

  const onBtnExport = () => gridRef.current.api.exportDataAsCsv();

  return (
    <>
      <SubContainer className="d-flex flex-wrap gap-2">
        {children}
        {tabs.length > 1 && tabSwitcher}
        <button
          className="btn btn-success bg-gradient"
          onClick={onBtnExport}
          type="button"
        >
          Download CSV export file
        </button>
      </SubContainer>
      {menuItems.length > 0 && (
        <SubContainer className="d-flex flex-wrap gap-2">
          {menuItems}
        </SubContainer>
      )}
      <SubContainer className="d-flex flex-wrap gap-2">
        {filterableFields.map(renderDropdownFilter)}
      </SubContainer>
      <SubContainer>
        <div style={{ height: 500 }}>
          <AgGridReact
            theme={themeBalham}
            ref={gridRef}
            {...gridProps}
          ></AgGridReact>
        </div>
      </SubContainer>
      {footnote}
    </>
  );
}
