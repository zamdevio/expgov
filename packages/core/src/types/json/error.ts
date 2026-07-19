export type JsonErrorData = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string | number | string[] | undefined>;
  };
};
