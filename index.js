const { log } = require("console");
const { readFileSync } = require("fs");
const { createServer } = require("https");
// const Express = require("express")();
// const Http = require("http").Server(Express);
// const io = require("socket.io")(Http, {
//   cors: {
//     origin: "*",
//   },
// });
const { Server } = require("socket.io");
const httpServer = createServer({
  key: readFileSync("/home/git/privkey.pem"),
  cert: readFileSync("/home/git/cert.pem")
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }})

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
      // socket.disconnect();
    });
  } else {
    console.log(socket);
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
});

// Http.listen(4040, () => {
//   console.log("Server up and running...");
// });

httpServer.listen(4040, ()=>{
  console.log("Server secure up and running...");
});