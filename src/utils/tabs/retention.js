import { getFilterLists, returnSelf, emptyList } from "./helpers";
import { dataKeyFormatter } from "./formatters";
import { getRetentionGridProps } from "./grid";

const retentionTab = {
  initialStates: {
    pivotConfig: {
      derived: {
        "%": (cell) =>
          cell.cohort.sum ? cell.retained.sum / cell.cohort.sum : 0,
      },
      value: ["cohort", "retained"],
      rows: ["Program"],
      column: "term",
      agg: "sum",
    },
    filters: {
      GRS: ["Official GRS (Full-time Bachelors Seeking)"],
    },
  },
  accessorFns: {
    lists: {
      pivotColumn: emptyList,
      pivotRows: returnSelf,
      aggType: emptyList,
    },
    filterLists: (obj) => getFilterLists(obj, "term"),
    gridProps: getRetentionGridProps,
    data: (value) => value || [],
    pivotConfig: returnSelf,
  },
  formatters: {
    dataValue: ([, value]) => value,
    dataKey: dataKeyFormatter,
  },
  label: "Retention",
  id: "retention",
};

export default retentionTab;
