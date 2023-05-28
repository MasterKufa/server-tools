import { fork } from 'child_process';
import * as yallist from 'yallist';
import { STANDARD_POOL_LIFETIME } from './constants';
import { PoolOptions, Task } from './types';
import * as os from 'os';

export class WorkersPool<T extends Task, U> {
  private controller: AbortController;
  private taskSequence: yallist<T> = yallist.create();
  private poolOptions: PoolOptions | null = null;
  // toDo make monitoring of really free cpus
  private freeCpus: number = os.cpus().length || 1;
  constructor(poolOptions?: PoolOptions) {
    this.controller = new AbortController();
    this.poolOptions = poolOptions;
  }

  planTask(task: T) {
    this.taskSequence.push(task);
    this.tryRunTask();
  }

  tryRunTask() {
    if (!Boolean(this.freeCpus)) return;

    const availableTask = this.taskSequence.shift();

    if (!availableTask) return;

    this.freeCpus -= 1;

    const worker = fork(availableTask.processPath, [], {
      timeout: this.poolOptions?.poolLifetime || STANDARD_POOL_LIFETIME,
      signal: this.controller.signal,
    });

    worker.send(availableTask);

    const handler = (result: U) => {
      this.freeCpus += 1;
      availableTask.callback(result);
      this.tryRunTask();

      worker.removeListener('message', handler);
      worker.kill();
    };

    worker.addListener('message', handler);
  }

  shutdown() {
    this.controller.abort();
  }
}
