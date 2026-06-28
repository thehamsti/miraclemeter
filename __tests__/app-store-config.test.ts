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

function readNativeFile(relativePath: string): string {
    return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    it("keeps app and widget native versions in sync with Expo config", () => {
        const version = config.version;
        if (!version) {
            throw new Error("Expo config version is required");
        }

        const project = readNativeFile("ios/miraclemeter.xcodeproj/project.pbxproj");
        const appInfo = readNativeFile("ios/miraclemeter/Info.plist");
        const widgetInfo = readNativeFile("ios/MiracleMeterWidget/Info.plist");
        const marketingVersionPattern = new RegExp(
            `MARKETING_VERSION = ${escapeRegExp(version)};`,
            "g",
        );

        expect(project.match(marketingVersionPattern)).toHaveLength(4);
        expect(project).not.toContain("MARKETING_VERSION = 1.4.3;");
        expect(project).toContain(`MARKETING_VERSION = ${version};`);

        for (const infoPlist of [appInfo, widgetInfo]) {
            expect(infoPlist).toContain("<string>$(MARKETING_VERSION)</string>");
            expect(infoPlist).toContain("<string>$(CURRENT_PROJECT_VERSION)</string>");
        }
    });
});
