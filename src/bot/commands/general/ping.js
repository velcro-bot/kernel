import { Command } from "../../../base/export.js";

export default class extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Calculate bot ping",
      enabled: true
    });

    this.set(new this.SlashCommand());
  };

  async execute({ interaction, guild, member }) {
    const api = this.client.ws.ping;
    const bot = Math.round(Date.now() - interaction.createdTimestamp);

    await interaction.deferReply({ ephemeral: true });

    const green = this.config.Emojis.Ping.GREEN;
    const orange = this.config.Emojis.Ping.ORANGE;
    const red = this.config.Emojis.Ping.RED;
    const blue = this.config.Emojis.Ping.BLUE;
    const yellow = this.config.Emojis.Ping.YELLOW;

    let api_status = green;
    let bot_status = green;

    if (api >= 150 && api < 300) api_status = blue;
    else if (api >= 300 && api < 600) api_status = orange;
    else if (api >= 600 && api < 1200) api_status = yellow;
    else if (api >= 1200) api_status = red;

    if (bot >= 150 && bot < 300) bot_status = blue;
    else if (bot >= 300 && bot < 600) bot_status = orange;
    else if (bot >= 600 && bot < 1200) bot_status = yellow;
    else if (bot >= 1200) bot_status = red;

    const embed = this.Embed({
      title: `${this.client.user.username} - Ping`,
      fields: [
        {
          name: `${this.config.Emojis.Other.TIME} WebSocket Ping`,
          value: `${api_status} \`${api}ms\``,
          inline: true
        },
        {
          name: `${this.config.Emojis.Other.TIME} API Ping`,
          value: `${bot_status} \`${bot}ms\``,
          inline: true
        }
      ],
      thumbnail: { url: guild?.iconURL() },
      footer: { iconURL: member?.displayAvatarURL() }
    });

    return interaction.editReply({ embeds: [embed] });
  };
};