const normalizeSvgs = (span) => {
  const svgs = [...span.querySelectorAll('svg')];
  svgs.forEach((svg) => {
    svg.setAttribute('style', 'width:30vmin;height30vmin;');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  });
};

export { normalizeSvgs };
