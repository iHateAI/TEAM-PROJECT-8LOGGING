const socket = require("socket.io");
const { chatService, channelService } = require("../services");

const socketConfig = (server) => {
  const io = socket(server, { path: "/chat-socket" });
  const chat = io.of("/chat");
  const channel = io.of("/channel");

  chat.on("connection", (socket) => {

    socket.on("enter-chat", async (data) => {
      socket.roomId = data.roomId;
      const chatLog = await chatService.getChatLog(socket.roomId);
      socket.join(socket.roomId);
      socket.emit("receive-chatLog", chatLog);
    });

    socket.on("create-chat", async (data) => {
      const createdChat = await chatService.addChatLog(
        socket.roomId,
        data.userId,
        data.chat
      );
      const userChatInfo = await chatService.getUserChatLog(createdChat._id);

      chat.to(socket.roomId).emit("receive-create-chat", userChatInfo);
    }); // data = {userId, roomId, chat}

    socket.on("modify-chat", async (data) => {
      await chatService.updateChatLog(data.chatId, data.chat);
      const userChatInfo = await chatService.getUserChatLog(data.chatId);

      chat.to(socket.roomId).emit("receive-modify-chat", userChatInfo);
    }); // data = {chatId, roomId, chat}

    socket.on("remove-chat", async (data) => {
      const userChatInfo = await chatService.getUserChatLog(data.chatId);
      await chatService.deleteChatLog(data.chatId, socket.roomId);

      chat.to(socket.roomId).emit("receive-remove-chat", userChatInfo);
    }); // data = {chatId, roomId}

    socket.on("remove-member", async (data) => {
      await channelService.quitChannel(data.userId, socket.roomId);
      chat
        .to(socket.roomId)
        .emit("receive-remove-member", { userId: data.userId });
    });

    socket.on("escape-room", () => {
      socket.leave(socket.roomId);
    });

    socket.on("disconnect", () => {
      socket.leave(socket.roomId);
    });
  });
};

module.exports = socketConfig;
