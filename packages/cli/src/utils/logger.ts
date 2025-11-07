import chalk from "chalk";

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue("ℹ"), message);
  },

  success: (message: string) => {
    console.log(chalk.green("✔"), message);
  },

  warn: (message: string) => {
    console.log(chalk.yellow("⚠"), message);
  },

  error: (message: string) => {
    console.log(chalk.red("✖"), message);
  },

  step: (step: number, total: number, message: string) => {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  },

  section: (title: string) => {
    console.log("\n" + chalk.bold.underline(title));
  },

  list: (items: string[]) => {
    items.forEach((item) => {
      console.log(chalk.gray("  •"), item);
    });
  },

  blank: () => {
    console.log();
  },
};
