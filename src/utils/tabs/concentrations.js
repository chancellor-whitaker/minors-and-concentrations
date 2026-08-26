import {
  concentrationDataKeyFormatter,
  dataValueFormatter,
} from "./formatters";
import { getFilterLists, emptyList, pinRows } from "./helpers";
import { concentrationDataAccessor } from "./dataAccessors";
import { createDetailGridProps } from "./grid";
import { jsonDataPromise } from "./data";

const pinnedRows = ["program", "concentration", "program_college"];

const gridProps = createDetailGridProps({
  fieldDefs: {
    concentration: {
      suppressSizeToFit: true,
      sortIndex: 1,
      sort: "asc",
    },
    program: {
      suppressSizeToFit: true,
      sortIndex: 0,
      sort: "asc",
    },
  },
  headerNames: {
    program_college: "Program College",
  },
});

const concentrationTab = {
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
    filterLists: (obj) => getFilterLists(obj, "college", "department"),
    data: concentrationDataAccessor,
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
    dataKey: concentrationDataKeyFormatter,
    dataValue: dataValueFormatter,
  },
  dataPromise: jsonDataPromise,
  label: "Concentrations",
  id: "concentrations",
};

export default concentrationTab;
