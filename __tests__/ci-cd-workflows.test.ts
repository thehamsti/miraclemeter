import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.join(__dirname, "..");

function readFile(relativePath: string): string {
    return fs.readFileSync(path.join(ROOT_DIR, relativePath), "utf8");
}

describe("CI/CD workflows", () => {
    it("defines non-watch validation scripts for CI", () => {
        const packageJson = JSON.parse(readFile("package.json")) as {
            scripts: Record<string, string>;
        };

        expect(packageJson.scripts.typecheck).toBe("tsc --noEmit");
        expect(packageJson.scripts["test:ci"]).toContain("--watchAll=false");
        expect(packageJson.scripts["test:ci"]).toContain("--no-watchman");
        expect(packageJson.scripts["config:check"]).toBe(
            "expo config --type public",
        );
    });

    it("requires Expo authentication for EAS GitHub workflows", () => {
        const workflowFiles = [
            ".github/workflows/eas-preview-update.yml",
            ".github/workflows/eas-production-build.yml",
            ".github/workflows/eas-production-update.yml",
        ];

        for (const workflowFile of workflowFiles) {
            const workflow = readFile(workflowFile);

            expect(workflow).toContain("secrets.EXPO_TOKEN");
            expect(workflow).toContain("Require Expo token");
            expect(workflow).toContain("--non-interactive");
        }
    });

    it("keeps production deployment manual instead of push-triggered", () => {
        const productionBuild = readFile(
            ".github/workflows/eas-production-build.yml",
        );
        const productionUpdate = readFile(
            ".github/workflows/eas-production-update.yml",
        );
        const easWorkflow = readFile(".eas/workflows/deploy-production.yml");

        for (const workflow of [productionBuild, productionUpdate, easWorkflow]) {
            expect(workflow).toContain("workflow_dispatch:");
            expect(workflow).not.toContain("push:");
        }

        expect(easWorkflow).not.toContain("type: fingerprint");
    });
});
