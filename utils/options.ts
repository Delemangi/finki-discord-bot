const transformations: { [index: string]: string[] } = {
  а: ['a'],
  б: ['b'],
  в: ['v'],
  г: ['g'],
  д: ['d'],
  е: ['e'],
  ж: ['z', 'zh'],
  з: ['z'],
  и: ['i'],
  к: ['k'],
  л: ['l'],
  м: ['m'],
  н: ['n'],
  о: ['o'],
  п: ['p'],
  р: ['r'],
  с: ['s'],
  т: ['t'],
  у: ['u'],
  ф: ['f'],
  х: ['h'],
  ц: ['c'],
  ч: ['c', 'ch'],
  ш: ['s', 'sh'],
  ѓ: ['g', 'gj'],
  ѕ: ['z', 'dz'],
  ј: ['j'],
  љ: ['l', 'lj'],
  њ: ['n', 'nj'],
  ќ: ['k', 'kj'],
  џ: ['d', 'dz', 'dzh', 'dj']
};

export function transformOptions (options: string[]): { [index: string]: string } {
  const results: { [index: string]: string } = {};

  for (const option of options) {
    for (const transformedOption of transform(option)) {
      results[transformedOption] = option;
    }
  }

  return results;
}

function transform (word: string): string[] {
  let suffixes: string[] = [];

  if (word.length === 1) {
    suffixes = [''];
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
}
