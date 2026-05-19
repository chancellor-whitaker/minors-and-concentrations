export default (key) => {
  const url = new URL(window.location.href);

  url.searchParams.delete(key);

  // Update URL without reload
  window.history.pushState({}, "", url);
};
