import SentryTransport from "../src/transport";
import * as Winston from "winston";
import {expect} from "chai";

const sentryFormat = Winston.format((info) => {
  const {...extra} = info;
  return {
    ...extra,
    tags: {
      formatted: true,
    },
  };
});

describe("SentryTransport", () => {
  it("test with simple formatter", (done) => {
    const transport = new SentryTransport({
      sentry: {
        dsn: "https://something@localhost:443/123",
        beforeSend(evt) {
          expect(evt.tags).to.have.property("formatted");
          expect((evt.tags || {}).formatted).to.equal(true);
          done();
          return evt;
        },
      },
      format: sentryFormat(),
      level: "info",
    });
    const logger = Winston.createLogger({
      transports: [transport],
    });
    logger.info("...");
  });

  it("should use the level derived from the symbol", (done) => {
    const transport = new SentryTransport({
      sentry: {
        dsn: "https://something@localhost:443/123",
        beforeSend(evt) {
          expect(evt.level).to.equal("warning");
          done();
          return evt;
        },
      },
      // Formatter which may change the level, like a `colorize`.
      format: Winston.format((info) => {
        info.level = "foo";
        return info;
      })(),
      level: "info",
    });

    const logger = Winston.createLogger({
      transports: [transport],
    });
    logger.warn("...");
  });
});
