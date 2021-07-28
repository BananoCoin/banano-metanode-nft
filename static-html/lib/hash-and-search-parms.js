const processHashAndSearchParms = () => {
  if (window.location.hash) {
    // console.log('window.location.hash', window.location.hash);
    const fn = window[window.location.hash.substring(1)];
    console.log('fn', fn);
    fn();
  }

  const searchParams = (new URL(document.location)).searchParams;
  const ids = Array.from(searchParams.keys());

  ids.forEach((id) => {
    const value = searchParams.get(id);
    const elt = document.getElementById(id);
    // console.log('document.location.searchParams', 'id', id);
    // console.log('document.location.searchParams', 'value', value);
    // console.log('document.location.searchParams', 'elt', elt);
    elt.value = value;
  });
};


export {processHashAndSearchParms};
