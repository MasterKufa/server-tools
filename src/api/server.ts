import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { SocketActions } from './types';
import jwt_decode from 'jwt-decode';
import { emitWithAnswer } from './client';

export const createServer = (opts?: { withAuthorization: boolean }) => {
  const server = new Server(Number(process.env.SERVER_PORT), {
    path: process.env.SERVER_PATH,
  });

  if (opts?.withAuthorization) {
    const clientUrl = new URL(process.env.AUTH_HOST);

    const authSocket = io(clientUrl.origin, {
      path: clientUrl.pathname ? `${clientUrl.pathname}/socket.io` : undefined,
      transports: ['websocket'],
    });

    server.use(async (socket, next) => {
      try {
        await emitWithAnswer(authSocket, SocketActions.VERIFY, {
          token: socket.handshake.auth.token,
        });

        socket.handshake.auth.decoded = jwt_decode(socket.handshake.auth.token);

        next();
      } catch (error) {
        next(new Error(error));
        socket.disconnect();
      }
    });
  }

  return server;
};
