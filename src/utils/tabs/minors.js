import { minorDataAccessor } from "./dataAccessors";
import { dataValueFormatter, minorDataKeyFormatter } from "./formatters";
import { createDetailGridProps } from "./grid";
import { emptyList, getFilterLists, pinRows } from "./helpers";

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
    gridProps,
    filterLists,
    pivotConfig: (obj) => ({
      ...obj,
      rows: pinRows(pinnedRows, obj.rows),
    }),
    lists: {
      pivotColumn: emptyList,
      pivotRows: emptyList,
      aggType: emptyList,
    },
    data: minorDataAccessor,
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
    dataValue: dataValueFormatter,
    dataKey: minorDataKeyFormatter,
  },
  label: "Minors",
  id: "minors",
};

export default minorTab;
