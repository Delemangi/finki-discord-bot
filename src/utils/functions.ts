import { client } from './client.js';

export function generatePollID (length: number, characters = '0123456789abcdef') {
  let ID = '';

  for (let index = 0; index < length; index++) {
    ID += characters[Math.floor(Math.random() * characters.length)];
  }

  return ID;
}

export function generatePercentageBar (percentage: number) {
  if (percentage === 0) {
    return '.'.repeat(20);
  }

  const pb = '█'.repeat(Math.floor(percentage / 5)) + (percentage - Math.floor(percentage) >= 0.5 ? '▌' : '');
  return pb + '.'.repeat(Math.max(0, 20 - pb.length));
}

export function createOptions (options: [string, string][], term: string) {
  return options
    .filter(([index]) => index.toLowerCase().includes(term.toLowerCase()))
    .map(([, c]) => ({
      name: c,
      value: c
    }))
    .filter((element, index, array) => array.findIndex((t) => t.name === element.name) === index)
    .slice(0, 25);
}

export function commandMention (name: string | undefined) {
  if (name === undefined) {
    return '';
  }

  const command = client.application?.commands.cache.find((c) => c.name === (name.includes(' ') ? name.split(' ').at(0) : name));

  if (command === undefined) {
    return name;
  }

  return `</${name}:${command.id}>`;
}
