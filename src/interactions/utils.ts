export const createOptions = (options: Array<[string, string]>, term: string) =>
  options
    .filter(([key]) => key.toLowerCase().includes(term.toLowerCase()))
    .map(([, value]) => ({
      name: value,
      value,
    }))
    .filter(
      (element, index, array) =>
        array.findIndex((item) => item.name === element.name) === index,
    )
    .slice(0, 25);
