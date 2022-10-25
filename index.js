const { log } = require("console");

const Express = require("express")();
const Http = require("http").Server(Express);
const io = require("socket.io")(Http, {
  cors: {
    origin: "*",
  },
});

io.on("connection", async (socket) => {
  const chatID = socket.handshake.auth.chatID;
  if(chatID){
    // console.log(chatID);
    // join the "userID" room
    socket.join(chatID);

    socket.on("browser_to_server", (data) =>  {
      console.log(data);
      io.emit("server_to_app", { chatID: chatID , msg: data.msg} );
    });
    
    console.log("reg close_to_server");
    socket.on("close_to_server", (data) =>  {
      console.log("close_to_server");
      console.log(data);
      io.emit("close_app", { chatID: chatID } );
      socket.dsconnect();
    });
  } else {
    // console.log("sem chatID");
    socket.on("app_to_server", (data) =>  {
      console.log(data);
      data = JSON.parse(data);
      io.to(data.to).emit("server_to_browser", { msg: data.msg} );
    });
  }
});

io.on("disconnection", (reason) => {
  console.log("reason");
  console.log(reason);
  // "ping timeout"
});

Http.listen(4040, () => {
  console.log("Server up and running...");
});
