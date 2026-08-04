import { createSocket } from "./socket";
import { getAccessToken } from "../api/axios";

export const socket = createSocket(getAccessToken());