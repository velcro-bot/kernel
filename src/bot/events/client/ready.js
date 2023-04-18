import { Event } from "../../../base/export.js";

export default class extends Event {
  constructor(client) {
    super(client, {
      name: "ready",
      enabled: true
    });
  };

  execute(i) {
    this.connections.create(this.config.configurations.VOICE_CHANNELS);
  };
};