import {
    withDangerousMod,
    withEntitlementsPlist,
    withXcodeProject,
    type ConfigPlugin,
} from "@expo/config-plugins";
import fs from "fs";
import path from "path";

const ICLOUD_SERVICES_KEY = "com.apple.developer.icloud-services";
const UBIQUITY_CONTAINER_IDENTIFIERS_KEY =
    "com.apple.developer.ubiquity-container-identifiers";

const ICLOUD_SERVICES = ["CloudDocuments"];
const UBIQUITY_CONTAINER_IDENTIFIERS = ["iCloud.com.hamstico.miraclemeter"];

// RCTEventEmitter is needed in the bridging header because ICloudSyncBridge
// extends it to emit "onChange" events. Expo regenerates the bridging header on
// prebuild, so the import must be re-added idempotently.
const BRIDGING_HEADER_IMPORTS = [
    "#import <React/RCTBridgeModule.h>",
    "#import <React/RCTEventEmitter.h>",
];

const SOURCE_FILES: readonly {
    path: string;
    fileType: string;
}[] = [
    {
        path: "miraclemeter/ICloudSyncBridge.swift",
        fileType: "sourcecode.swift",
    },
    {
        path: "miraclemeter/ICloudSyncBridge.m",
        fileType: "sourcecode.c.objc",
    },
];

function hasFileReference(
    project: {
        pbxFileReferenceSection(): Record<string, unknown>;
    },
    filename: string,
): boolean {
    const section = project.pbxFileReferenceSection();
    return Object.keys(section).some((key) => {
        const entry = section[key];
        if (entry === null || typeof entry !== "object") return false;
        const record = entry as { basename?: string; path?: string };
        return (
            record.basename === filename ||
            (typeof record.path === "string" && record.path.endsWith(`/${filename}`))
        );
    });
}

const withIcloudEntitlements: ConfigPlugin = (config) => {
    return withEntitlementsPlist(config, (newConfig) => {
        const entitlements = newConfig.modResults;
        // Merge (do not replace) — leaves aps-environment, associated-domains and
        // application-groups intact.
        entitlements[ICLOUD_SERVICES_KEY] = ICLOUD_SERVICES;
        entitlements[UBIQUITY_CONTAINER_IDENTIFIERS_KEY] =
            UBIQUITY_CONTAINER_IDENTIFIERS;
        return newConfig;
    });
};

const withIcloudSources: ConfigPlugin = (config) => {
    return withXcodeProject(config, (newConfig) => {
        const project = newConfig.modResults;
        const groupName = newConfig.modRequest.projectName ?? "miraclemeter";

        const groupKey = project.findPBXGroupKey({ name: groupName });
        if (!groupKey) {
            console.warn(
                `withIcloudSync: PBXGroup "${groupName}" not found; skipping source registration. ` +
                    `Verify the new native files compile after prebuild.`,
            );
            return newConfig;
        }

        // `addSourceFile` routes the file to the correct target's Sources build
        // phase via opt.target. This must be the target UUID (not the name) so it
        // lands in the app target rather than the widget extension.
        const targetKey = project.findTargetKey(groupName);

        for (const { path, fileType } of SOURCE_FILES) {
            const filename = path.split("/").pop();
            if (filename !== undefined && hasFileReference(project, filename)) {
                continue;
            }
            project.addSourceFile(
                path,
                { lastKnownFileType: fileType, target: targetKey },
                groupKey,
            );
        }

        return newConfig;
    });
};

const withIcloudBridgingHeader: ConfigPlugin = (config) => {
    return withDangerousMod(config, [
        "ios",
        async (modConfig) => {
            const projectName =
                modConfig.modRequest.projectName ?? "miraclemeter";
            const headerPath = path.join(
                modConfig.modRequest.platformProjectRoot,
                projectName,
                `${projectName}-Bridging-Header.h`,
            );

            let contents = "";
            if (fs.existsSync(headerPath)) {
                contents = await fs.promises.readFile(headerPath, "utf8");
            }

            let changed = false;
            for (const line of BRIDGING_HEADER_IMPORTS) {
                if (!contents.includes(line)) {
                    contents = `${contents.trimEnd()}\n${line}\n`;
                    changed = true;
                }
            }

            if (changed) {
                await fs.promises.writeFile(headerPath, contents);
            }
            return modConfig;
        },
    ]);
};

const withIcloudSync: ConfigPlugin = (config) => {
    return withIcloudBridgingHeader(
        withIcloudSources(withIcloudEntitlements(config)),
    );
};

export default withIcloudSync;
