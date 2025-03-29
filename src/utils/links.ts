export const getNormalizedLink = (url: string) =>
  url.startsWith('http') ? url : `https://${url}`;
