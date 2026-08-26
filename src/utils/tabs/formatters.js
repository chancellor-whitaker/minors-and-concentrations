const globalHeaderRules = {
  department: "Student Department",
  college: "Student College",
  priority_no: "Program No",
  ft_pt: "FT / PT",
  GRS: "GRSe",
};

const minorHeaderRules = {
  ...globalHeaderRules,
  priority: "Minor Priority",
};

const concentrationHeaderRules = {
  ...globalHeaderRules,
  priority: "Conc Priority",
};

const globalValueRules = {};

const percentageFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: "percent",
});

export const defaultValueFormatter = ({ value }) => value?.toLocaleString();
export const formatPercentage = ({ value }) => percentageFormatter.format(value);

export const snakeToTitle = (value) =>
  (typeof value === "string" ? value : "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const formatKey = (rules) => (key) =>
  key in rules ? rules[key] : snakeToTitle(key);

export const dataKeyFormatter = formatKey(globalHeaderRules);
export const minorDataKeyFormatter = formatKey(minorHeaderRules);
export const concentrationDataKeyFormatter = formatKey(
  concentrationHeaderRules,
);

export const dataValueFormatter = ([key, value]) =>
  key in globalValueRules && value in globalValueRules[key]
    ? globalValueRules[key][value]
    : value;
