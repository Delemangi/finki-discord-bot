let crossposting = true;

export function getCrossposting (): boolean {
  return crossposting;
}

export function toggleCrossposting (): boolean {
  crossposting = !crossposting;

  return crossposting;
}
