let crossposting = true;

export const getCrossposting = () => {
  return crossposting;
};

export const toggleCrossposting = () => {
  crossposting = !crossposting;

  return crossposting;
};
