export default (key, value) => {
  const url = new URL(window.location.href);

  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }

  // Update URL without reload
  window.history.pushState({}, "", url);
};
