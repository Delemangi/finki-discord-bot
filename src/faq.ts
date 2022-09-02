import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import {
  getFromBotConfig,
  getQuestions
} from './config.js';

const questions = getQuestions();

export function getAllQuetions (): string[] {
  return questions.map((q) => q.question);
}

export function getAllOptions (): Option[] {
  return questions.map((q) => ({
    name: q.question.replaceAll('`', ''),
    value: q.question
  }));
}

export function getQuestion (name: string): Question {
  return questions.find((q) => q.question === name) ?? {
    answer: 'No question found',
    question: 'No question found'
  };
}

export function getEmbedFromQuestion (question: Question): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(getFromBotConfig('color'))
    .setTitle(question.question)
    .setDescription(question.answer)
    .setTimestamp();

  return embed;
}

export function getComponentsFromQuestion (question: Question): ActionRowBuilder<ButtonBuilder>[] {
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (question.links === undefined) {
    return [];
  }

  const entries = Object.entries(question.links);

  for (let i = 0; i < entries.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons: ButtonBuilder[] = [];

    for (let j = i; j < i + 5; j++) {
      const [label, link] = entries[j] ?? ['', ''];
      if (label === undefined || link === undefined || label === '' || link === '') {
        break;
      }

      const button = new ButtonBuilder()
        .setURL(link)
        .setLabel(label)
        .setStyle(ButtonStyle.Link);

      buttons.push(button);
    }

    row.addComponents(buttons);
    components.push(row);
  }

  return components;
}
