import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { SocketActions, SocketErrors, SocketResponse } from './types';
import { nanoid } from 'nanoid';

export const createServer = (opts?: { withAuthorization: boolean }) => {
  const server = new Server(Number(process.env.SERVER_PORT));

  if (opts?.withAuthorization) {
    const authSocket = io(process.env.AUTH_HOST, {
      transports: ['websocket'],
    });

    server.use((socket, next) => {
      authSocket.emit(SocketActions.VERIFY, {
        requestId: nanoid(),
        token: socket.handshake.auth.token,
      });
      authSocket.on(SocketActions.VERIFY, ({ error }: SocketResponse<void>) =>
        next(error && new Error(error)),
      );
    });
  }

  return server;
};
