/**
 * Canonical relationship between the logged-in user and a searched user.
 * Mirrors the backend `Relationship` union in user.controller.ts.
 *
 *   "self"             → hide the card entirely (never shown in results)
 *   "friend"           → "Message"
 *   "request_sent"     → "Request Sent" (disabled)
 *   "request_received" → "Accept Request" (+ Decline)
 *   "none"             → "Add Friend"
 */

export interface User {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  isOnline: boolean;
  lastSeen?: string;
  isVerified?: boolean;

  /**
   * Canonical relationship field populated by search/suggestions endpoints.
   * The UI renders its action button from this single value — never from a
   * combination of boolean flags (which caused the missing "Add Friend"
   * button when the request_received / friend cases weren't handled).
   */
  relationship?:
    | "self"
    | "friend"
    | "request_sent"
    | "request_received"
    | "none";

  // Backward-compatible boolean flags (legacy consumers can keep working).
  isFriend?: boolean;
  requestSent?: boolean;
  incomingRequest?: boolean;
}
