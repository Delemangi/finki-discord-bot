/* eslint-disable id-length */
const transformations = {
  а: ["a"],
  А: ["A"],
  б: ["b"],
  Б: ["B"],
  в: ["v"],
  В: ["V"],
  г: ["g"],
  Г: ["G"],
  д: ["d"],
  Д: ["D"],
  е: ["e"],
  Е: ["E"],
  ж: ["z", "zh"],
  Ж: ["Z", "ZH"],
  з: ["z"],
  З: ["Z"],
  и: ["i"],
  И: ["I"],
  к: ["k"],
  К: ["K"],
  л: ["l"],
  Л: ["L"],
  м: ["m"],
  М: ["M"],
  н: ["n"],
  Н: ["N"],
  о: ["o"],
  О: ["O"],
  п: ["p"],
  П: ["P"],
  р: ["r"],
  Р: ["R"],
  с: ["s"],
  С: ["S"],
  т: ["t"],
  Т: ["T"],
  у: ["u"],
  У: ["U"],
  ф: ["f"],
  Ф: ["F"],
  х: ["h"],
  Х: ["H"],
  ц: ["c"],
  Ц: ["C"],
  ч: ["c", "ch"],
  Ч: ["C", "CH"],
  ш: ["s", "sh"],
  Ш: ["S", "SH"],
  ѓ: ["g", "gj"],
  Ѓ: ["G", "GJ"],
  ѕ: ["z", "dz"],
  Ѕ: ["Z", "DZ"],
  ј: ["j"],
  Ј: ["J"],
  љ: ["l", "lj"],
  Љ: ["L", "LJ"],
  њ: ["n", "nj"],
  Њ: ["N", "NJ"],
  ќ: ["k", "kj"],
  Ќ: ["K", "KJ"],
  џ: ["d", "dz", "dzh", "dj"],
  Џ: ["D", "DZ", "DZH", "DJ"],
};

const transform = (word: string) => {
  let suffixes: string[] = [];

  if (word.length === 1) {
    suffixes = [""];
  } else {
    suffixes = transform(word.slice(1));
  }

  const transformed: string[] = [];

  // @ts-expect-error even if this is undefined, nullish coalescing works just fine
  for (const letter of transformations[word[0]] ?? word[0]) {
    for (const suffix of suffixes) {
      transformed.push(letter + suffix);
    }
  }

  return transformed;
};

export const transformOptions = (options: string[]) => {
  const results: { [index: string]: string } = {};

  for (const option of options) {
    for (const transformedOption of transform(option)) {
      results[transformedOption] = option;
    }

    results[option] = option;
  }

  return results;
};
