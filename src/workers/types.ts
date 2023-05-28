export type Task = {
  [key: string]: any;
  processPath: string;
  callback: (result: any) => void;
};

export type PoolOptions = {
  poolLifetime?: number;
};
