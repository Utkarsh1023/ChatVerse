import type { SocketUserId } from "./types";

/**
 * In-memory presence map.
 * Production note: for multi-instance deployments, use Redis adapter.
 */
export class OnlineUsers {
  private byUserId = new Map<SocketUserId, string>(); // userId -> socketId

  set(userId: SocketUserId, socketId: string) {
    this.byUserId.set(userId, socketId);
  }

  getSocketId(userId: SocketUserId): string | undefined {
    return this.byUserId.get(userId);
  }

  /**
   * Removes any mapping for this socket.
   * Returns removed userId if found.
   */
  removeBySocketId(socketId: string): SocketUserId | undefined {
    for (const [userId, mappedSocketId] of this.byUserId.entries()) {
      if (mappedSocketId === socketId) {
        this.byUserId.delete(userId);
        return userId;
      }
    }
    return undefined;
  }
}

