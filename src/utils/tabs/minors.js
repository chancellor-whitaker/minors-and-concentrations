import { minorDataKeyFormatter, dataValueFormatter } from "./formatters";
import { getFilterLists, emptyList, pinRows } from "./helpers";
import { minorDataAccessor } from "./dataAccessors";
import { createDetailGridProps } from "./grid";
import { jsonDataPromise } from "./data";

const pinnedRows = ["minor", "minor_college"];

const gridProps = createDetailGridProps({
  fieldDefs: {
    minor: { suppressSizeToFit: true, sort: "asc" },
  },
  headerNames: {
    minor_college: "Minor College",
  },
});

const filterLists = (obj) => {
  const lists = getFilterLists(obj, "college", "department");

  return Object.fromEntries(
    Object.entries(lists).map(([key, values]) =>
      key === "minor_college"
        ? [key, new Set([...values].filter(Boolean))]
        : [key, values],
    ),
  );
};

const minorTab = {
  accessorFns: {
    lists: {
      pivotColumn: emptyList,
      pivotValue: emptyList,
      pivotRows: emptyList,
      aggType: emptyList,
    },
    pivotConfig: (obj) => ({
      ...obj,
      rows: pinRows(pinnedRows, obj.rows),
    }),
    data: minorDataAccessor,
    filterLists,
    gridProps,
  },
  initialStates: {
    pivotConfig: {
      rows: pinnedRows,
      column: "term",
      value: "total",
      agg: "sum",
    },
  },
  formatters: {
    dataKey: minorDataKeyFormatter,
    dataValue: dataValueFormatter,
  },
  dataPromise: jsonDataPromise,
  label: "Minors",
  id: "minors",
};

export default minorTab;
