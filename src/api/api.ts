import { Socket } from 'socket.io';
import { ApiHandlers } from './types';

export class Api<T extends string> {
  constructor(private handlers: ApiHandlers<T>) {}

  async handle(action: T, socket: Socket, payload: { requestId?: string }) {
    try {
      await this.handlers[action](socket, payload);
    } catch ({ message }) {
      payload.requestId &&
        socket.emit(action, { requestId: payload.requestId, error: message });
    }
  }
}
