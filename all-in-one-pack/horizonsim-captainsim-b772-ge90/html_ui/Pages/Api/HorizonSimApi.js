class HorizonSimApi {    
}

class Hoppie {
    constructor({ hoppieKey, flightNumber }) {
      this.hoppieBaseURL = "http://www.hoppie.nl/acars/system/connect.html?";
      this.iid = 1;
      this.parseResponse = (data) => {
        if (data.substring(0, 2) !== "ok")
          throw "RESPONSE NOT OK";
        const regex = /{([^}]+)}/g;
        const messages = data.match(regex);
        if (!messages)
          return [];
        messages.map((m) => m.substring(1));
        const parsedMessages = [];
        messages.forEach((m) => {
          m = m.substring(1);
          const [from, type] = m.split(" ");
          const packet = m.substring(m.indexOf("{") + 1, m.lastIndexOf("}"));
          if (!from || !type || !packet)
            return;
          if (type === "cpdlc") {
            return parsedMessages.push({
              timestamp: (/* @__PURE__ */ new Date()).valueOf(),
              from,
              type,
              packet: this.parseCPDLCPacket(packet)
            });
          }
          return parsedMessages.push({
            timestamp: (/* @__PURE__ */ new Date()).valueOf(),
            from,
            //@ts-ignore - type is a valid type
            type,
            packet
          });
        });
        return parsedMessages.reverse();
      };
      this.parseCPDLCPacket = (packet) => {
        const [_, bus, topic, topic_reply, replyType, message] = packet.split("/");
        if (bus === void 0 || topic === void 0 || topic_reply === void 0 || replyType === void 0 || message === void 0) {
          throw "INVALID CPDLC PACKET";
        }
        return {
          bus,
          topic: parseInt(topic),
          topic_reply: isNaN(parseInt(topic_reply)) ? void 0 : parseInt(topic_reply),
          replyType,
          message
        };
      };
      this.hoppieKey = hoppieKey;
      this.flightNumber = SubscribableUtils.toSubscribable(flightNumber, true);
    }
    async poll() {
      return await fetch("http://www.hoppie.nl/acars/systems.php");
    }
    async send(to, type, packet, overrideFrom) {
      if (this.flightNumber.get() === "" && overrideFrom === void 0)
        throw "FLIGHT NUMBER NOT SET";
      const key = this.hoppieKey.get();
      const url = `${this.hoppieBaseURL}logon=${key}&from=${this.flightNumber.get() || overrideFrom}&to=${to}&type=${type}${packet ? `&packet=${packet}` : ""}`;
      console.log(url);
      const response = await fetch(url).then((r) => r.text()).then((r) => this.parseResponse(r));
      return response;
    }
    async sendCPDLC(to, replyType, packet, overrideFrom, topicReply) {
      const cpdlcPacket = `/data2/${this.InteralId}/${topicReply || ""}/${replyType}/${packet}`;
      return await this.send(to, "cpdlc", cpdlcPacket, overrideFrom);
    }
    get InteralId() {
      return this.iid++;
    }
  }
