const fetchJson = (url) => fetch(url).then((res) => res.json());

const dataOrder = ["base", "concentrations", "descriptions", "minors"];

const promises = dataOrder.map((name) => fetchJson(`data/${name}.json`));

export const dataPromise = Promise.all(promises);

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

const headerRules = {};

const valueRules = {};

const allButMinor = (arr) => arr.filter((s) => s !== "minor");

const allButConc = (arr) =>
  arr.filter((s) => s !== "program" && s !== "concentration");

export default [
  {
    accessorFns: {
      columnDefs: (arr) => {
        const fieldDefs = { minor: { sort: "asc" } };

        return arr.map((def) => ({ ...def, ...fieldDefs[def.field] }));
      },
      lists: {
        pivotColumn: allButMinor,
        pivotRows: allButMinor,
        aggType: (arr) => arr,
      },
      pivotConfig: (obj) => ({
        ...obj,
        rows: ["minor", ...allButMinor(obj.rows)],
      }),
      data: minorDataAccessor,
      filterLists: (x) => x,
    },
    formatters: {
      dataValue: ([k, v]) =>
        k in valueRules && v in valueRules[k] ? valueRules[k][v] : v,
      dataKey: (k) => (k in headerRules ? headerRules[k] : k),
    },
    initialStates: {
      pivotConfig: {
        rows: ["minor"],
        column: "term",
        value: "total",
        agg: "sum",
      },
    },
    label: "Minors",
    id: "minors",
  },
  {
    accessorFns: {
      columnDefs: (arr) => {
        const fieldDefs = {
          concentration: { sortIndex: 1, sort: "asc" },
          program: { sortIndex: 0, sort: "asc" },
        };

        return arr.map((def) => ({ ...def, ...fieldDefs[def.field] }));
      },
      pivotConfig: (obj) => ({
        ...obj,
        rows: ["program", "concentration", ...allButConc(obj.rows)],
      }),
      lists: {
        pivotColumn: allButConc,
        aggType: (arr) => arr,
        pivotRows: allButConc,
      },
      filterLists: (obj) => obj,
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
    formatters: {
      dataValue: ([, v]) => v,
      dataKey: (k) => k,
    },
    label: "Concentrations",
    id: "concentrations",
  },
];

// props api
// - formatters
// - accessor fns
// - initial states
