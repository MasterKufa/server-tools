import { ChildProcess } from 'child_process';

export type Task = {
  [key: string]: any;
  callback: (result: any) => void;
};

export type Worker = {
  worker: ChildProcess;
  isFree: boolean;
};

export type PoolOptions = {
  poolLifetime?: number;
  processPath: string;
};
