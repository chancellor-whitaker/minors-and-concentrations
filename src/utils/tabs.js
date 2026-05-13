import { csv } from "d3-fetch";

const fetchJson = (url) => fetch(url).then((res) => res.json());

const autoSizeGrid = ({ api }) => {
  // api.autoSizeAllColumns();
  api.sizeColumnsToFit();
};

const autoSizeProps = {
  // autoSizeStrategy: { type: "fitCellContents" },
  onGridSizeChanged: autoSizeGrid,
  onRowDataUpdated: autoSizeGrid,
  onBodyScrollEnd: autoSizeGrid,
};

const dataOrder = ["base", "concentrations", "descriptions", "minors"];

const promises = dataOrder.map((name) => fetchJson(`data/m&c/${name}.json`));

const dataPromise1 = Promise.all(promises);

export const dataPromise2 = csv(
  "data/retention/202650_12MAY2026_ProgramEnrollments.csv",
);

export const dataPromise = dataPromise2;

const concDataAccessor = (result) => {
  if (!result) return [];

  const data = Object.fromEntries(
    dataOrder.map((name, i) => [name, result[i]]),
  );

  return data.concentrations.map(({ base_id: bId, conc_id: cId, ...rest }) => ({
    ...data.base[bId],
    ...rest,
    concentration: data.descriptions[cId],
  }));
};

const minorDataAccessor = (result) => {
  if (!result) return [];

  const data = Object.fromEntries(
    dataOrder.map((name, i) => [name, result[i]]),
  );

  return data.minors.map(({ minor_id: mId, base_id: bId, ...rest }) => ({
    ...data.base[bId],
    ...rest,
    minor: data.descriptions[mId],
  }));
};

const globalHeaderRules = { priority_no: "Program No", ft_pt: "FT / PT" };

const minorHeaderRules = { ...globalHeaderRules, priority: "Minor Priority" };

const concHeaderRules = {
  ...globalHeaderRules,
  priority: "Conc. Priority",
};

const globalValueRules = {};

const getAllButMinor = (arr) => arr.filter((s) => s !== "minor");

const getAllButConc = (arr) =>
  arr.filter((s) => s !== "program" && s !== "concentration");

const defaultValueFormatter = ({ value }) => value?.toLocaleString();

const getMinorColDefs = (arr) => {
  const fieldDefs = { minor: { suppressSizeToFit: true, sort: "asc" } };

  return arr.map((def) => ({
    ...def,
    valueFormatter: defaultValueFormatter,
    ...fieldDefs[def.field],
  }));
};

const snakeToTitle = (str) => {
  return (typeof str === "string" ? str : "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const minorDKeyFormatter = (k) =>
  k in minorHeaderRules ? minorHeaderRules[k] : snakeToTitle(k);

const concDKeyFormatter = (k) =>
  k in concHeaderRules ? concHeaderRules[k] : snakeToTitle(k);

const getConcColDefs = (arr) => {
  const fieldDefs = {
    concentration: { suppressSizeToFit: true, sortIndex: 1, sort: "asc" },
    program: { suppressSizeToFit: true, sortIndex: 0, sort: "asc" },
  };

  return arr.map((def) => ({
    ...def,
    valueFormatter: defaultValueFormatter,
    ...fieldDefs[def.field],
  }));
};

const returnSelf = (x) => x;

const rArrow = "→";

const parseArrows = (colDefs) => {
  const arr = [];

  const findColGroup = (str) =>
    arr.find(({ headerName }) => headerName === str.split(rArrow)[0]);

  const addColGroup = (str) =>
    arr.push({ headerName: str.split(rArrow)[0], children: [] });

  const findColChild = (str, element) =>
    element.children.find(({ field }) => field === str.split(rArrow)[1]);

  const addColChild = (str, element) =>
    element.children.push({ headerName: str.split(rArrow)[1], field: str });

  const filteredColDefs = colDefs.filter(({ field }) => field.includes(rArrow));

  filteredColDefs.forEach(({ field }) => {
    if (!findColGroup(field)) addColGroup(field);

    const colGroup = findColGroup(field);

    if (!findColChild(field, colGroup)) addColChild(field, colGroup);
  });

  return arr;
};

const getFilterLists = (obj, ...arr) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k]) =>
        !["retained", "cohort", "total", "race", "sex", "URM", ...arr].includes(
          k,
        ),
    ),
  );

const dataValueFormatter = ([k, v]) =>
  k in globalValueRules && v in globalValueRules[k]
    ? globalValueRules[k][v]
    : v;

const retentionTab = {
  accessorFns: {
    gridProps: ({ columnDefs, ...params }, { pivotConfig: { rows } }) => {
      const colDefs = [
        ...columnDefs.filter(({ field }) => !field.includes(rArrow)),
        ...parseArrows(columnDefs),
      ];

      return {
        columnDefs: colDefs.map((def) => ({
          ...def,
          suppressSizeToFit: rows.includes(def.field),
        })),
        ...params,
        ...autoSizeProps,
      };
    },
    lists: {
      pivotColumn: () => [],
      pivotRows: returnSelf,
      aggType: () => [],
    },
    filterLists: (obj) => getFilterLists(obj, "term"),
    data: (x) => (!x ? [] : x),
    pivotConfig: returnSelf,
  },
  initialStates: {
    pivotConfig: {
      value: ["cohort", "retained"],
      rows: ["Program"],
      column: "term",
      agg: "sum",
    },
  },
  formatters: {
    dataValue: ([, v]) => v,
    dataKey: snakeToTitle,
  },
  label: "Retention",
  id: "retention",
};

const minorTab = {
  accessorFns: {
    gridProps: ({ columnDefs, ...params }, { pivotConfig }) => {
      const pivotRows = pivotConfig.rows;

      return {
        ...params,
        ...autoSizeProps,
        columnDefs: getMinorColDefs(columnDefs).map((o) => ({
          ...o,
          type: pivotRows.includes(o.field) ? null : "numericColumn",
        })),
      };
    },
    pivotConfig: (obj) => ({
      ...obj,
      rows: ["minor", ...getAllButMinor(obj.rows)],
    }),
    lists: {
      pivotColumn: () => [],
      pivotRows: () => [],
      aggType: () => [],
    },
    filterLists: getFilterLists,
    data: minorDataAccessor,
  },
  initialStates: {
    pivotConfig: {
      rows: ["minor"],
      column: "term",
      value: "total",
      agg: "sum",
    },
  },
  formatters: { dataValue: dataValueFormatter, dataKey: minorDKeyFormatter },
  label: "Minors",
  id: "minors",
};

const concTab = {
  accessorFns: {
    gridProps: ({ columnDefs, ...params }, { pivotConfig }) => {
      const pivotRows = pivotConfig.rows;

      return {
        ...params,
        ...autoSizeProps,
        columnDefs: getConcColDefs(columnDefs).map((o) => ({
          ...o,
          type: pivotRows.includes(o.field) ? null : "numericColumn",
        })),
      };
    },
    pivotConfig: (obj) => ({
      ...obj,
      rows: ["program", "concentration", ...getAllButConc(obj.rows)],
    }),
    lists: {
      pivotColumn: () => [],
      pivotRows: () => [],
      aggType: () => [],
    },
    filterLists: getFilterLists,
    data: concDataAccessor,
  },
  initialStates: {
    pivotConfig: {
      rows: ["program", "concentration"],
      column: "term",
      value: "total",
      agg: "sum",
    },
  },
  formatters: { dataValue: dataValueFormatter, dataKey: concDKeyFormatter },
  label: "Concentrations",
  id: "concentrations",
};

export default dataPromise === dataPromise1
  ? [minorTab, concTab]
  : [retentionTab];

// props api
// - formatters
// - accessor fns
// - initial states
