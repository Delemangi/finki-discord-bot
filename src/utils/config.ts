import { getConfig, setConfig } from "../data/Config.js";
import { type BotConfig } from "../types/BotConfig.js";
import { type Classroom } from "../types/Classroom.js";
import { type CourseInformation } from "../types/CourseInformation.js";
import { type CourseParticipants } from "../types/CourseParticipants.js";
import { type CoursePrerequisites } from "../types/CoursePrerequisites.js";
import { type CourseStaff } from "../types/CourseStaff.js";
import { type InfoBlock } from "../types/InfoBlock.js";
import { type LevelConfig } from "../types/LevelConfig.js";
import { type Link } from "../types/Link.js";
import { type QuizQuestions } from "../types/QuizQuestions.js";
import { type RoleConfig } from "../types/RoleConfig.js";
import { type Staff } from "../types/Staff.js";
import { readFileSync } from "node:fs";
import { env } from "node:process";

const defaultConfig: BotConfig = {
  channels: {
    activity: "",
    commands: "",
    oath: "",
    polls: "",
    vip: "",
  },
  color: "#313183",
  crosspost: true,
  crosspostChannels: [],
  ephemeralReplyTime: 5_000,
  guild: "810997107376914444",
  leveling: true,
  logo: "https://cdn.discordapp.com/attachments/946729216152576020/1016773768938541106/finki-logo.png",
  roles: {
    admin: "",
    booster: "",
    contributor: "",
    fss: "",
    ombudsman: "",
    vip: "",
    vipInvited: "",
    vipVoting: "",
  },
  temporaryVIPChannel: {
    cron: "20 4 * * *",
    name: "🚪︱задни-соби",
    parent: "1060626238760300685",
  },
};

const databaseConfig = await getConfig();
const config: BotConfig =
  databaseConfig === null ? defaultConfig : (databaseConfig.value as BotConfig);

export const checkEnvironmentVariables = async () => {
  const token = env["TOKEN"];
  const applicationId = env["APPLICATION_ID"];

  if (token === undefined) {
    throw new Error("TOKEN environment variable is not defined");
  }

  if (applicationId === undefined) {
    throw new Error("APPLICATION_ID environment variable is not defined");
  }
};

export const getConfigProperty = async <T extends keyof BotConfig>(key: T) => {
  return config[key] ?? defaultConfig[key];
};

export const setConfigProperty = async <T extends keyof BotConfig>(
  key: T,
  value: BotConfig[T]
) => {
  config[key] = value;

  return (await setConfig(config))?.value;
};

export const getConfigKeys = () => {
  return Object.keys(defaultConfig) as Array<keyof BotConfig>;
};

export const getToken = () => {
  return env["TOKEN"] as string;
};

export const getApplicationId = () => {
  return env["APPLICATION_ID"] as string;
};

const anto: string[] = JSON.parse(readFileSync("./config/anto.json", "utf8"));
const classrooms: Classroom[] = JSON.parse(
  readFileSync("./config/classrooms.json", "utf8")
);
const companies: string[] = JSON.parse(
  readFileSync("./config/companies.json", "utf8")
);
const courses: string[] = JSON.parse(
  readFileSync("./config/courses.json", "utf8")
);
const info: InfoBlock[] = JSON.parse(
  readFileSync("./config/info.json", "utf8")
);
const information: CourseInformation[] = JSON.parse(
  readFileSync("./config/information.json", "utf8")
);
const levels: LevelConfig = JSON.parse(
  readFileSync("./config/levels.json", "utf8")
);
const links: Link[] = JSON.parse(readFileSync("./config/links.json", "utf8"));
const participants: CourseParticipants[] = JSON.parse(
  readFileSync("./config/participants.json", "utf8")
);
const prerequisites: CoursePrerequisites[] = JSON.parse(
  readFileSync("./config/prerequisites.json", "utf8")
);
const professors: CourseStaff[] = JSON.parse(
  readFileSync("./config/professors.json", "utf8")
);
const quiz: QuizQuestions = JSON.parse(
  readFileSync("./config/quiz.json", "utf8")
);
const roles: RoleConfig = JSON.parse(
  readFileSync("./config/roles.json", "utf8")
);
const rules: string[] = JSON.parse(readFileSync("./config/rules.json", "utf8"));
const sessions: { [index: string]: string } = JSON.parse(
  readFileSync("./config/sessions.json", "utf8")
);
const staff: Staff[] = JSON.parse(readFileSync("./config/staff.json", "utf8"));

export const getAnto = () => {
  return anto;
};

export const getClassrooms = () => {
  return classrooms;
};

export const getCompanies = () => {
  return companies;
};

export const getCourses = () => {
  return courses;
};

export const getInfo = () => {
  return info;
};

export const getInformation = () => {
  return information;
};

export const getLevels = () => {
  return levels;
};

export const getLinks = () => {
  return links;
};

export const getParticipants = () => {
  return participants;
};

export const getProfessors = () => {
  return professors;
};

export const getPrerequisites = () => {
  return prerequisites;
};

export const getQuiz = () => {
  return quiz;
};

export const getFromRoleConfig = <T extends keyof RoleConfig>(key: T) => {
  return roles[key];
};

export const getRules = () => {
  return rules;
};

export const getSessions = () => {
  return sessions;
};

export const getStaff = () => {
  return staff;
};
