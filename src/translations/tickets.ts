import { roleMention, userMention } from 'discord.js';

export const ticketMessages = {
  sendMessage: 'Напишете ја Вашата порака во следните 5 минути.',
};

export const ticketMessageFunctions = {
  createTicket: (adminRole: string) =>
    `# Тикети\nДоколку имате некакво прашање, проблем, предлог, или слично, имате можност да креирате тикет до соодветните луѓе преку овој канал. Изберете го типот на тикетот и напишете го Вашето образложение. Вашиот тикет е приватен и ќе може да биде разгледуван од само групата луѓе до кои е испратен и ${roleMention(adminRole)}. Ќе добиете одговор во најбрз можен рок.\n\nМожете да испратите тикет до:`,
  ticketCreated: (userId: string) =>
    `${userMention(userId)} Ова е Ваш приватен тикет. Образложете го Вашиот проблем или прашање овде. Ќе добиете одговор во најбрз можен рок. Доколку сакате да го затворите тикетот, притиснете го копчето за затворање.`,
  ticketLink: (ticketLink: string) => `Креиран е Вашиот тикет: ${ticketLink}`,
  ticketStarted: (roles: string) => `${roles} Креиран е тикет до Вас.`,
};
