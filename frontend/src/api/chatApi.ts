import API from "./axios";

export const getMessages = (receiverId: string) =>
  API.get(`/chat/messages/${receiverId}`);

