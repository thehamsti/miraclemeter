import * as fs from "fs";
import * as path from "path";

import config from "../app.config";

const ASSOCIATED_DOMAIN_PATTERN = /^applinks:[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function readAppEntitlements(): string {
    return fs.readFileSync(
        path.join(__dirname, "..", "ios", "miraclemeter", "miraclemeter.entitlements"),
        "utf8",
    );
}

describe("App Store config", () => {
    it("uses a fully qualified associated domain", () => {
        const domains = config.ios?.associatedDomains ?? [];

        expect(domains).toContain("applinks:miraclemeter.app");

        for (const domain of domains) {
            expect(domain).toMatch(ASSOCIATED_DOMAIN_PATTERN);
        }
    });

    it("keeps the native iOS entitlement in sync with Expo config", () => {
        const entitlements = readAppEntitlements();

        expect(entitlements).toContain("<string>applinks:miraclemeter.app</string>");
        expect(entitlements).not.toContain("<string>applinks:miraclemeter</string>");
    });
});
