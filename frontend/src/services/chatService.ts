import API from "../api/axios"; // Your configured axios instance
import type { Conversation } from "../types/chat";
import type { User } from "../types/user";

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await API.get("/conversations", {
    withCredentials: true,
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const createOrGetConversation = async (
  receiverId: string
): Promise<Conversation> => {
  const response = await API.post(
    "/conversations",
    { receiverId },
    { withCredentials: true }
  );

  return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await API.get(`/users/search?q=${query}`, {
    withCredentials: true,
  });

  return response.data?.users ?? [];
};
