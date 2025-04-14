import { hyperlink, userMention } from 'discord.js';

export const botName = 'ФИНКИ Discord Бот';

export const aboutMessage = (helpCommand: string, faqCommand: string) =>
  `Овој бот е развиен од ${userMention(
    '198249751001563136',
  )} за потребите на Discord серверот на студентите на ФИНКИ. Ботот е open source и може да се најде на ${hyperlink(
    'GitHub',
    'https://github.com/finki-hub/finki-discord-bot',
  )}. Ако имате било какви прашања, предлози или проблеми, контактирајте нè на Discord или на GitHub. \n\nНапишете ${helpCommand} за да ги видите сите достапни команди, или ${faqCommand} за да ги видите сите достапни прашања.`;
