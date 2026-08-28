export const DEFAULT_WRAPPER_REMOTE_URL =
  "https://irserver2.eku.edu/libraries/remote/r19-wrapper.cjs";

function getRandomId() {
  return Math.random().toString(36).substring(2, 11);
}

function shouldAppendRandomId() {
  return import.meta.env.VITE_WRAPPER_APPEND_RANDOM_ID === "true";
}

function appendRandomId(url) {
  const hashIndex = url.indexOf("#");
  const baseUrl = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const separator = baseUrl.includes("?") ? "&" : "?";

  return `${baseUrl}${separator}v=${getRandomId()}${hash}`;
}

export function getWrapperRemoteUrl() {
  const url =
    import.meta.env.VITE_WRAPPER_REMOTE_URL || DEFAULT_WRAPPER_REMOTE_URL;

  return shouldAppendRandomId() ? appendRandomId(url) : url;
}
