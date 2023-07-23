import { Socket } from 'socket.io-client';
import { SocketResponse } from './types';
import { nanoid } from 'nanoid';

export const emitWithAnswer = <T, V>(
  socket: Socket,
  action: string,
  payload: T,
): Promise<V> =>
  new Promise((resolve, reject) => {
    const requestId = nanoid();

    socket.emit(action, { ...payload, requestId });

    const answerHandler = (response: SocketResponse<V>) => {
      if (requestId !== response.requestId) return;

      socket.off(action, answerHandler);

      if (response.error) {
        reject(response.error);

        return;
      }

      resolve(response.payload);
    };

    socket.on(action, answerHandler);
  });
