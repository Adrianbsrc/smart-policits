import { Logger } from "@nestjs/common";

const logger = new Logger("Security");

export const SecurityLogger = {
  log: (message: string) => logger.log(message),
  warn: (message: string) => logger.warn(message),
  error: (message: string, stack?: string) => logger.error(message, stack),
};
