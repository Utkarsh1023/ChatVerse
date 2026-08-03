import API from "../api/axios";

export const searchUsers = async (query: string) => {
  const res = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
  return res.data.users;
};

export const getSuggestions = async () => {
  const res = await API.get("/users/suggestions");
  return res.data.users;
};