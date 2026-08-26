import {
  concentrationDataKeyFormatter,
  dataValueFormatter,
} from "./formatters";
import { getFilterLists, emptyList, pinRows } from "./helpers";
import { concentrationDataAccessor } from "./dataAccessors";
import { createDetailGridProps } from "./grid";

// Need to create a CEP dashboard to show enrollment by term with filters for Cohort Description, Program, Grad/UG - that's enough for now.

const filterFields = ["COHORT_DESCRIPTION", "PROGRAM"];

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

const corporateTab = {
  accessorFns: {
    lists: {
      pivotColumn: emptyList,
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
      value: "ENR_YR_PRIOR_TO_CHRT",
      column: "TERM_CODE",
      rows: pinnedRows,
      agg: "sum",
    },
  },
  formatters: {
    dataKey: concentrationDataKeyFormatter,
    dataValue: dataValueFormatter,
  },
  label: "Corporate Partners",
  id: "corporate",
};

export default corporateTab;
