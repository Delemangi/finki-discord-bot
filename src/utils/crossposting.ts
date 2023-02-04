let crossposting = true;

export function getCrossposting () {
  return crossposting;
}

export function toggleCrossposting () {
  crossposting = !crossposting;

  return crossposting;
}
