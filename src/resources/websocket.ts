import { Manager } from "socket.io-client";

const manager = new Manager("http://10.1.91.71:5000", {
  autoConnect: true
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    console.log('connected')
  } else {
    console.log('connection error')
  }
});
