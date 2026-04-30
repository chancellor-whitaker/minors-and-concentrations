// if data comes in with columns of conc_x & minor_x, then count how many conc cols and count how many minor cols

export default [
  {
    id: "minors",
    label: "Minors",
    initialStates: { pivotRow: ["minor"], pivotColumn: "term" },
    accessorFns: {
      data: (arr) =>
        [arr]
          .filter(Boolean)
          .flat()
          .flatMap(({ concentration, ...row }) =>
            (row["minor"].length === 0 ? [""] : row["minor"]).map((str) => ({
              ...row,
              minor: str,
            })),
          ),
      columnDefs: (arr) => {
        const fieldDefs = { minor: { sort: "asc" } };

        return arr.map((def) => ({ ...def, ...fieldDefs[def.field] }));
      },
      pivotColumn: (str) => str,
      pivotRow: (arr) => ["minor", ...arr.filter((s) => s !== "minor")],
      pivotRowOptions: (arr) => arr.filter((s) => s !== "minor"),
      pivotColumnOptions: (arr) => arr.filter((s) => s !== "minor"),
    },
  },
  {
    id: "concentrations",
    label: "Concentrations",
    initialStates: {
      pivotRow: ["program", "concentration"],
      pivotColumn: "term",
    },
    accessorFns: {
      data: (arr) =>
        [arr]
          .filter(Boolean)
          .flat()
          .flatMap(({ minor, ...row }) =>
            (row["concentration"].length === 0
              ? [""]
              : row["concentration"]
            ).map((str) => ({
              ...row,
              concentration: str,
            })),
          ),
      columnDefs: (arr) => {
        const fieldDefs = {
          program: { sort: "asc", sortIndex: 0 },
          concentration: { sort: "asc", sortIndex: 1 },
        };

        const isTerm = (s) =>
          typeof s === "string" &&
          s.split(" ").length === 2 &&
          ["spring", "summer", "fall", "winter"].includes(
            s.toLowerCase().split(" ")[0],
          );

        const terms = arr.map(({ field }) => field).filter(isTerm);

        console.log(terms);

        return arr.map((def) => ({ ...def, ...fieldDefs[def.field] }));
      },
      pivotColumn: (str) => str,
      pivotRow: (arr) => [
        "program",
        "concentration",
        ...arr.filter((s) => s !== "program" && s !== "concentration"),
      ],
      pivotRowOptions: (arr) =>
        arr.filter((s) => s !== "program" && s !== "concentration"),
      pivotColumnOptions: (arr) =>
        arr.filter((s) => s !== "program" && s !== "concentration"),
    },
  },
];
