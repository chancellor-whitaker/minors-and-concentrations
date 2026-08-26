import {
  defaultValueFormatter,
  formatPercentage,
  snakeToTitle,
} from "./formatters";

export const ARROW = "→";

const autoSizeGrid = (event) => {
  event.api.autoSizeAllColumns();
};

export const autoSizeProps = {
  autoSizeStrategy: { type: "fitCellContents" },
  onGridSizeChanged: autoSizeGrid,
  onRowDataUpdated: autoSizeGrid,
};

export const defaultColDef = {
  suppressMovable: true,
  lockVisible: true,
};

const rowSortProps = (rows, def) =>
  rows.includes(def.field)
    ? {
        sortIndex: rows.indexOf(def.field),
        suppressSizeToFit: true,
        sort: "asc",
      }
    : {};

export const parseArrowColumns = (columnDefs) => {
  const groups = [];

  const findGroup = (field) =>
    groups.find(({ headerName }) => headerName === field.split(ARROW)[0]);

  const addGroup = (field) =>
    groups.push({ headerName: field.split(ARROW)[0], children: [] });

  const findChild = (field, group) =>
    group.children.find(({ field: childField }) => childField === field.split(ARROW)[1]);

  const addChild = (field, group) =>
    group.children.push({
      valueFormatter: field.includes("%")
        ? formatPercentage
        : defaultValueFormatter,
      headerName: snakeToTitle(field.split(ARROW)[1]),
      type: "numericColumn",
      field,
    });

  columnDefs
    .filter(({ field }) => field.includes(ARROW))
    .forEach(({ field }) => {
      if (!findGroup(field)) addGroup(field);

      const group = findGroup(field);
      if (!findChild(field, group)) addChild(field, group);
    });

  return groups;
};

export const getRetentionGridProps = (
  { columnDefs, ...params },
  { pivotConfig: { rows } },
) => {
  const normalizedColumnDefs = [
    ...columnDefs.filter(({ field }) => !field.includes(ARROW)),
    ...parseArrowColumns(columnDefs),
  ];

  return {
    columnDefs: normalizedColumnDefs.map((def) => ({
      ...def,
      ...rowSortProps(rows, def),
    })),
    defaultColDef,
    ...params,
    ...autoSizeProps,
  };
};

export const createDetailGridProps = ({
  fieldDefs,
  headerNames = {},
  numericColumnLimit = 3,
}) =>
  ({ columnDefs, ...params }, { pivotConfig }) => {
    const pivotRows = pivotConfig.rows;

    const formattedColumnDefs = columnDefs.map((def) => ({
      ...def,
      valueFormatter: defaultValueFormatter,
      ...fieldDefs[def.field],
      ...(def.field.includes(ARROW)
        ? { headerName: def.field.split(ARROW)[0] }
        : headerNames[def.field]
          ? { headerName: headerNames[def.field] }
          : {}),
      type: pivotRows.includes(def.field) ? null : "numericColumn",
    }));

    return {
      ...params,
      ...autoSizeProps,
      defaultColDef,
      columnDefs: [
        ...formattedColumnDefs.filter(({ type }) => type === null),
        ...formattedColumnDefs
          .filter(({ type }) => type === "numericColumn")
          .slice(-numericColumnLimit),
      ],
    };
  };
