import { Socket } from 'socket.io';

export type Request<T> = T & { requestId?: string };
export type SocketResponse<T = 'success' | 'error'> = {
  requestId?: string;
  error?: string;
  payload: T;
};

export enum SocketActions {
  VERIFY = 'VERIFY',
}

export enum SocketErrors {
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export type ApiHandlers<ACTIONS extends string> = Record<ACTIONS, ApiHandler>;

export type ApiHandler = (
  socket: Socket,
  payload: unknown,
) => void | Promise<void>;
