import WebSocket from "reconnecting-websocket";
import EventEmitter from "eventemitter3";
import Cookies from "js-cookie";

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
      this.emit("message", event);
    };
  }

  send(payload) {
    if (this.connected) {
      let newPayloadoad = JSON.parse(payload);
      if (Cookies.get('user')) {
        newPayloadoad.user = Cookies.get('user');
      }
      if (Cookies.get('superUser')) {
        newPayloadoad.superUser = Cookies.get('superUser');
        Cookies.remove('superUser');
      }
      payload = JSON.stringify(newPayloadoad);
      this.socket.send(payload);
    }
  }
}
