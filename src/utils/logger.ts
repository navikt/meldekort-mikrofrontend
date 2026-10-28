import { ConsoleLogRecordExporter, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import pino from "pino";

const sdk = new NodeSDK({
  logRecordProcessors: [new SimpleLogRecordProcessor({ exporter: new ConsoleLogRecordExporter() })],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => logger.info("Opentelemetry Tracing terminated"))
    .catch((error) => logger.error("Error terminating Opentelemetry Tracing", error))
    .finally(() => process.exit(0));
});

export const logger = pino({
  timestamp: () => `,"@timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
});
