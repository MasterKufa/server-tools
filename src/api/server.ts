import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { SocketActions, SocketResponse } from './types';
import { nanoid } from 'nanoid';
import jwt_decode from 'jwt-decode';

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
      authSocket.on(SocketActions.VERIFY, ({ error }: SocketResponse<void>) => {
        if (!error) {
          socket.handshake.auth.decoded = jwt_decode(
            socket.handshake.auth.token,
          );
        }

        next(error && new Error(error));
      });
    });
  }

  return server;
};
