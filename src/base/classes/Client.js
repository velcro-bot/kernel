import { Client as Base, IntentsBitField as Intents, Partials } from "discord.js";
import logs from "discord-logs";

import { s } from "@sapphire/shapeshift";

import Loader from "./Loader.js";

import ora from "ora";

import { BitField, enumToObject } from "@sapphire/bitfield";

export class Client extends Base {
  /**
   * @param {string} token
   * @param {import("discord.js").ClientOptions} options
   * @constructor
   */
  constructor(token = process.env["TOKEN"], options) {
    s.string.parse(token);

    super({
      intents: (new BitField(enumToObject(Intents.Flags))).mask,
      partials: Object.values(Partials).filter((partial) => typeof partial === "string"),
      ...options
    });

    logs(this);

    /**
     * @type {string}
     * @readonly
     */
    this.token = token;

    /**
     * @type {Loader}
     * @private
     */
    this.loader = new Loader(this);
  };

  /**
   * @returns {Promise<void>}
   */
  async login() {
    let spinner = ora("Connecting to Gateway");

    this.loader.once("ready", async () => {
      spinner.start();
      
      super.login(this.token).then(async () => {
        spinner.succeed("Connected to Gateway.");

        await this.application.commands.set([]);
        await this.application.commands.set(this.loader.commands);
      });

      return void 0;
    });

    await this.loader.All();

    return void 0;
  };
};

export default Client;

new Client().login();