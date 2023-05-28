import { fork } from 'child_process';
import { range } from 'lodash';
import * as yallist from 'yallist';
import { STANDARD_POOL_LIFETIME } from './constants';
import { PoolOptions, Task, Worker } from './types';
import os from 'os';

export class WorkersPool<T extends Task, U> {
  private pool: Worker[];
  private controller: AbortController;
  private taskSequence: yallist<T> = yallist.create();
  constructor(poolOptions: PoolOptions) {
    this.controller = new AbortController();
    this.pool = [];

    range(os.cpus().length).forEach(() => {
      this.pool.push({
        worker: fork(poolOptions.processPath, [], {
          timeout: poolOptions.poolLifetime || STANDARD_POOL_LIFETIME,
          signal: this.controller.signal,
        }),
        isFree: true,
      });
    });
  }

  planTask(task: T) {
    this.taskSequence.push(task);
    this.tryRunTask();
  }

  tryRunTask() {
    const freeWorker = this.pool.find((worker) => worker.isFree);
    const availableTask = this.taskSequence.shift();

    if (!(freeWorker && availableTask)) return;

    freeWorker.isFree = false;
    freeWorker.worker.send(availableTask);

    const handler = (result: U) => {
      freeWorker.isFree = true;
      availableTask.callback(result);
      this.tryRunTask();

      freeWorker.worker.removeListener('message', handler);
    };

    freeWorker.worker.addListener('message', handler);
  }

  shutdown() {
    this.controller.abort();
  }
}
