# CI/CD

MiracleMeter uses GitHub Actions for repo-visible CI/CD and EAS for iOS
builds, signing, submissions, and OTA updates.

## GitHub Workflows

- `CI`: runs on pull requests and pushes to `main`; installs with pnpm, then
  runs typecheck, lint, tests, and Expo config validation.
- `EAS Preview Update`: publishes an iOS EAS Update to `pr-<number>` for
  same-repository pull requests. Forked pull requests skip this workflow because
  GitHub does not expose repository secrets to forked code.
- `EAS Production Build`: manually builds the iOS production profile and can
  submit the completed build to TestFlight.
- `EAS Production Update`: manually publishes a production OTA update with an
  explicit rollout percentage.

The remaining `.eas/workflows/deploy-production.yml` workflow is manual-only and
kept as an EAS-native fallback. It no longer runs automatically on every push to
`main`.

## GitHub Secrets

Required repository secret:

- `EXPO_TOKEN`: an Expo access token with permission to build and update the
  `miraclemeter` EAS project.

Create the token in Expo, then add it to GitHub:

```bash
gh secret set EXPO_TOKEN --repo thehamsti/miraclemeter --body "YOUR_EXPO_TOKEN"
```

Do not store Apple signing certificates, provisioning profiles, or App Store
Connect API keys as GitHub secrets for this project. Those credentials should
stay in EAS credentials and EAS submit configuration. `eas.json` already points
production iOS submissions at App Store Connect app `6745537256`.

## Manual Release Flow

For a native iOS release, run the `EAS Production Build` workflow from GitHub
Actions. Leave `submit` enabled to send the build to TestFlight after EAS
finishes the archive.

Native EAS build profiles set `EXPO_USE_PRECOMPILED_MODULES=0` so CocoaPods uses
the project dependencies from `node_modules`. Keep that override unless Expo's
precompiled external module scripts are confirmed to handle this project's pod
layout.

For a JavaScript-only change that is safe for the current runtime version, run
the `EAS Production Update` workflow. Start with a smaller rollout percentage
when the change has meaningful product or data risk.
