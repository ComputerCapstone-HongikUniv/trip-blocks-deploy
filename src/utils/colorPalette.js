const colorPalette = {
  blue: "#D7EEFC",
  green: "#E4F7DA",
  pink: "#FBEDFE",
  orange: "#FBEACF",
  yellow: "#FBF8C4",
  other: "#D6D6D6"
};

export const getHexColor = (blockColor) => {
  if (!blockColor) return colorPalette.other;
  return colorPalette[blockColor] || colorPalette.other;
};