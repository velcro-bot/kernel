import PATH, { read, error, stat, delay } from "../../Utils.js";
import Storage, { commands, events, handlers } from "./Storage.js";

import ora from "ora";
import chalk from "chalk";

import { Client, CommandInteraction } from "discord.js";

export function Loader(client) {
  if (!(client instanceof Client)) error(TypeError, "InvalidClient", `'${client}' is not a ${chalk.redBright("discord.js Client")}.`);

  /**
   * Load events into Storage.
   * @returns {Promise<string[]>}
   */
  async function Event() {
    let home = "src/bot/events/";

    let spinner = ora("Events Loading").start();

    const source = read(home, { filter: (dir) => stat(home.concat(dir)).isDirectory() });

    let total = 0;
    let loaded = 0;

    const _events = [];
    for (let index = 0; index < source.length; index++) {
      const dirs = read(home.concat(source[index]), { filter: (file) => stat(home.concat(`${source[index]}/${file}`)).isFile() });
      total += dirs.length;

      for (let i = 0; i < dirs.length; i++) {
        const file = dirs[i];

        await (import(`${PATH}/${home.concat(`${source[index]}/`).concat(file)}`)).then((constructor) => {
          /**
           * @type {import("../../structures/dist/Event.js").default}
           */
          const event = new (constructor.default)(client);

          if (event?.name && event?.enabled) {
            events.set(event.name, event);

            let base = client;
            if (event.mode === "process") base = process;

            base[event?.once ? "once" : "on"](event.name, (...args) => {
              const interaction = args[0];

              if (interaction instanceof CommandInteraction) {
                if (event.type === "Menu" && (interaction?.isMentionableSelectMenu() || interaction?.isChannelSelectMenu() || interaction?.isRoleSelectMenu() || interaction?.isStringSelectMenu() || interaction?.isUserSelectMenu())) event.execute(...args);
                else if (event.type === "ChatCommand" && (interaction?.isChatInputCommand())) event.execute(...args);
                else if (event.type === "ContextCommand" && (interaction?.isContextMenuCommand())) event.execute(...args);
                else if (event.type === "Button" && (interaction?.isButton())) event.execute(...args);
                else if (event.type === "Modal" && (interaction?.isModalSubmit())) event.execute(...args);

                else event.execute(...args);
              }

              else event.execute(...args);
            });

            loaded++;

            _events.push(event.name);

            spinner.text = `Events Loading (${chalk.blueBright(loaded)}/${chalk.greenBright(total)})`;
          };
        });
      };
    };

    spinner.stop();

    return _events;
  };

  /**
   * Load all handlers into Storage.
   * @returns {Promise<string[]>}
   */
  async function Handler() {
    let home = "src/bot/handlers/";

    let spinner = ora("Handlers Loading").start();

    const source = read(home, { filter: (dir) => stat(home.concat(dir)).isDirectory() });

    let total = 0;
    let loaded = 0;

    const _handlers = [];
    for (let index = 0; index < source.length; index++) {
      const dirs = read(home.concat(source[index]), { filter: (file) => stat(home.concat(`${source[index]}/${file}`)).isFile() });
      total += dirs.length;

      for (let i = 0; i < dirs.length; i++) {
        const file = dirs[i];

        await (import(`${PATH}/${home.concat(`${source[index]}/`).concat(file)}`)).then((constructor) => {
          /**
           * @type {import("../../structures/dist/Handler.js").default}
           */
          const handler = new (constructor.default)(client);

          if (handler?.name && handler?.enabled) {
            handlers.set(handler.name, handler);

            let base = client;
            if (handler.mode === "process") base = process;

            base[handler?.once ? "once" : "on"](handler.name, (...args) => {
              const interaction = args[0];

              if (interaction instanceof CommandInteraction) {
                if (handler.type === "Menu" && (interaction?.isMentionableSelectMenu() || interaction?.isChannelSelectMenu() || interaction?.isRoleSelectMenu() || interaction?.isStringSelectMenu() || interaction?.isUserSelectMenu())) handler.execute(...args);
                else if (handler.type === "ChatCommand" && (interaction?.isChatInputCommand())) handler.execute(...args);
                else if (handler.type === "ContextCommand" && (interaction?.isContextMenuCommand())) handler.execute(...args);
                else if (handler.type === "Button" && (interaction?.isButton())) handler.execute(...args);
                else if (handler.type === "Modal" && (interaction?.isModalSubmit())) handler.execute(...args);

                else handler.execute(...args);
              }

              else handler.execute(...args);
            });

            loaded++;

            _handlers.push(handler.name);

            spinner.text = `Handlers Loading (${chalk.blueBright(loaded)}/${chalk.greenBright(total)})`;
          };
        });
      };
    };

    spinner.stop();

    return _handlers;
  };

  /**
   * Load all commands into Storage.
   * @returns {Promise<any>}
   */
  async function Command() {
    let home = "src/bot/commands/";

    let spinner = ora("Commands Loading").start();

    const source = read(home, { filter: (dir) => stat(home.concat(dir)).isDirectory() });

    let total = 0;
    let loaded = 0;

    const _commands = [];
    for (let index = 0; index < source.length; index++) {
      const dirs = read(home.concat(source[index]), { filter: (file) => stat(home.concat(`${source[index]}/${file}`)).isFile() });
      total += dirs.length;

      for (let i = 0; i < dirs.length; i++) {
        const file = dirs[i];

        await (import(`${PATH}/${home.concat(`${source[index]}/`).concat(file)}`)).then((constructor) => {
          /**
           * @type {import("../../structures/dist/Command.js").default}
           */
          const command = new (constructor.default)(client);

          if (command?.name && command?.enabled) {
            commands.set(command.name, command);

            loaded++;

            _commands.push(command.data);

            spinner.text = `Commands Loading (${chalk.blueBright(loaded)}/${chalk.greenBright(total)})`;
          };
        });
      };
    };

    spinner.stop();

    return _commands;
  };

  /**
   * Load all.
   * @param {() => void} callback
   * @returns {Promise<void>}
   */
  async function All(callback = null) {
    if (callback && typeof callback !== "function") callback = () => { };

    const events = await Event();
    const handlers = await Handler();
    const commands = await Command();

    await callback({ commands, events, handlers });

    return void 0;
  };

  return {
    Command,
    Event,
    Handler,
    All
  };
};

export default Loader;