import WebSocket from "reconnecting-websocket";
import EventEmitter from "eventemitter3";
import Cookies from "js-cookie";
import moment from "moment";

const urlParams = new URLSearchParams(window.location.search);
export default class Socket extends EventEmitter {
  socket;
  connected = false;

  constructor(uri) {
    super();
    if (uri) {
      this.setup(uri);
    }
  }

  setup(uri) {
    this.socket = new WebSocket(uri);
    this.socket.addEventListener("open", () => {
      this.connected = true;
      this.emit("open");
    });

    this.socket.onmessage = (event) => {
      if (moment) {
        let data = JSON.parse(event.data);
        if (moment(data.sentTime).add(3,'seconds').isSameOrAfter(moment())) this.emit("message", event);
      }
    };
  }

  send(payload) {
    if (this.connected) {
      let newPayloadoad = JSON.parse(payload);
      if (Cookies.get('user')) {
        newPayloadoad.user = Cookies.get('user');
      }

      if (moment) {
        newPayloadoad.sentTime = moment();
      }

      payload = JSON.stringify(newPayloadoad);

      this.socket.send(payload);
    }

    const payloadObject = JSON.parse(payload);
    fetch('https://portfolioadmin.amilcruise.com/api/currentslide/update', {
      method: 'POST',
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Origin": "*",
          "Accept": "application/json",
      },
      mode: 'no-cors',
      body: "groupId=1&slideNumber=" + payloadObject.state.route.slide
    });
  }
}
