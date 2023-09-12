import { Socket } from 'socket.io';
import { ApiHandlers, SocketResponse } from './types';

export class Api<T extends string> {
  constructor(private handlers: ApiHandlers<T>) {}

  async handle(action: T, socket: Socket, payload: { requestId?: string }) {
    try {
      const answer = await this.handlers[action](payload, socket);

      if (answer && payload.requestId) {
        const successResponse: SocketResponse<typeof answer> = {
          requestId: payload.requestId,
          payload: answer,
        };

        socket.emit(action, successResponse);
      }
    } catch ({ message }) {
      payload.requestId &&
        socket.emit(action, { requestId: payload.requestId, error: message });
    }
  }
}
