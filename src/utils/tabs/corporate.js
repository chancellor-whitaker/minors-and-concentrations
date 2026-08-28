import { dataValueFormatter, dataKeyFormatter } from "./formatters";
import { pickFilterLists, returnSelf, emptyList } from "./helpers";
import { getRetentionGridProps } from "./grid";
import { corporatePromise } from "./data";

// * try making font size smaller in headers in header groups
// * allow for changing valueFields
// switch old filters for wrapper filters
// export csv file with arrows or by duplicating top header values
// add csv download to wrapper?

const filterFields = ["COHORT_DESCRIPTION", "PROGRAM", "MINOR"];
const pinnedRows = ["COHORT_DESCRIPTION", "PROGRAM", "MINOR"];
const valueFields = [
  "EKUID",
  "CREDIT_HRS",
  "STANDARD_CHARGE",
  "ACTUAL_CHARGE",
  "DISCOUNTED_AMT",
  "DISCOUNT_RATE",
];

const corporateTab = {
  accessorFns: {
    lists: {
      pivotValue: () => valueFields,
      pivotColumn: emptyList,
      pivotRows: returnSelf,
      aggType: returnSelf,
    },
    filterLists: (obj) => pickFilterLists(obj, filterFields),
    gridProps: getRetentionGridProps,
    data: (value) => value || [],
    pivotConfig: returnSelf,
  },
  initialStates: {
    pivotConfig: {
      agg: [["count"], ["sum", "avg"]],
      value: ["EKUID", "CREDIT_HRS"],
      column: "TERM_CODE",
      rows: pinnedRows,
    },
  },
  formatters: {
    dataValue: dataValueFormatter,
    dataKey: dataKeyFormatter,
  },
  dataPromise: corporatePromise,
  label: "Corporate Partners",
  id: "corporate",
};

export default corporateTab;
