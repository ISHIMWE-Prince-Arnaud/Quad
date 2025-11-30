import { endpoints } from "@/lib/api";
import type { ApiNotification } from "@/types/api";

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: ApiNotification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
  message?: string;
}

export class NotificationService {
  static async getNotifications(
    params: GetNotificationsParams = {}
  ): Promise<GetNotificationsResponse> {
    const response = await endpoints.notifications.getAll({
      page: params.page,
      limit: params.limit,
      unreadOnly: params.unreadOnly,
    });
    return response.data as GetNotificationsResponse;
  }

  static async getUnreadCount(): Promise<number> {
    const response = await endpoints.notifications.getUnreadCount();
    const data = response.data as {
      success: boolean;
      data?: { unreadCount?: number };
    };
    return data.data?.unreadCount ?? 0;
  }

  static async markAsRead(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await endpoints.notifications.markAsRead(id);
    return response.data as { success: boolean; message?: string };
  }

  static async markAllAsRead(): Promise<{
    success: boolean;
    message?: string;
    data?: { count: number };
  }> {
    const response = await endpoints.notifications.markAllAsRead();
    return response.data as {
      success: boolean;
      message?: string;
      data?: { count: number };
    };
  }

  static async deleteNotification(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await endpoints.notifications.delete(id);
    return response.data as { success: boolean; message?: string };
  }

  static async deleteAllRead(): Promise<{
    success: boolean;
    message?: string;
    data?: { count: number };
  }> {
    const response = await endpoints.notifications.deleteAllRead();
    return response.data as {
      success: boolean;
      message?: string;
      data?: { count: number };
    };
  }
}
