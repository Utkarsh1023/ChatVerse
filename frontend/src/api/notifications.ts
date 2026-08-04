import API from "./axios";

export interface NotificationResponse {
  notifications: any[];
  unreadCount: number;
  hasMore: boolean;
}

export const getNotifications = async (
  page = 1,
  limit = 20
): Promise<NotificationResponse> => {
  const { data } = await API.get(
    `/notifications?page=${page}&limit=${limit}`
  );

  return data.data;
};

export const markNotificationRead = async (id: string) => {
  await API.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await API.patch("/notifications/read-all");
};

export const deleteNotification = async (id: string) => {
  await API.delete(`/notifications/${id}`);
};

export const getUnreadCount = async () => {
  const { data } = await API.get(
    "/notifications/unread-count"
  );

  return data.data.unreadCount;
};