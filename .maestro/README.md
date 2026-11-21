# Maestro UI flows

Interactive UI tests for MiracleMeter, run against a simulator build of the
PR branch. These are authored but not yet executed end-to-end: the local Mac
still runs a beta Xcode (27A5209h) that macOS 27.2.1 refuses to load its
simulator service (DTServiceHub) for. Run them after installing stable
Xcode 27.2.

## Run

```bash
# build + install the app, then:
xcrun simctl boot "hamsti-design QA iPhone 16"
maestro test .maestro/001-launch-onboarding.yml
maestro test .maestro/002-add-birth-record.yml   # chains 001 internally
maestro test .maestro/003-settings-stats.yml
maestro test .maestro/004-data-persists.yml
```

Screenshots land in `.maestro_output/` (default). Flow 001 assumes a fresh
install (first-run onboarding); erase or reinstall the app before re-running
the chain. Flows 002-004 each invoke 001 first, so run them on a clean
simulator too.

CI: not wired into GitHub Actions on purpose — Maestro needs a macOS runner
with Xcode and hardware acceleration that the repo's ubuntu CI does not have.
