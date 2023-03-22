import { client } from './client.js';

export const splitMessage = function* (message: string) {
  if (message === '') {
    yield '';
    return;
  }

  const delimiters = ['\n'];
  const length = 1_950;
  let output;
  let index = message.length;
  let split;
  let currentMessage = message;

  while (currentMessage) {
    if (currentMessage.length > length) {
      split = true;
      for (const char of delimiters) {
        index = currentMessage.slice(0, length).lastIndexOf(char) + 1;

        if (index) {
          split = false;
          break;
        }
      }

      if (split) {
        index = length;
      }

      output = currentMessage.slice(0, Math.max(0, index));
      currentMessage = currentMessage.slice(index);
    } else {
      output = currentMessage;
      currentMessage = '';
    }

    yield output;
  }
};

export const commandMention = (name: string | undefined) => {
  if (name === undefined) {
    return '';
  }

  const command = client.application?.commands.cache.find(
    (com) => com.name === (name.includes(' ') ? name.split(' ')[0] : name),
  );

  if (command === undefined) {
    return name;
  }

  return `</${name}:${command.id}>`;
};

export const createOptions = (
  options: Array<[string, string]>,
  term: string,
) => {
  return options
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
};
