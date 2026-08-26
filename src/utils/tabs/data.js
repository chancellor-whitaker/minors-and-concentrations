import { csv } from "d3-fetch";

export const dataOrder = ["base", "concentrations", "descriptions", "minors"];

const fetchJson = (url) => fetch(url).then((res) => res.json());

const jsonPromises = dataOrder.map((name) => fetchJson(`data/${name}.json`));

export const jsonDataPromise = Promise.all(jsonPromises);
export const dataPromise2 = csv("data/202650_12MAY2026_ProgramEnrollments.csv");

export const corporatePromise = fetchJson("data/corporate.json");

export const dataPromise = corporatePromise;
