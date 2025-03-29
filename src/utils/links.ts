export const getNormalizedUrl = (url: string) =>
  url.startsWith('http') ? url : `https://${url}`;
