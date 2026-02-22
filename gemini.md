# Project Context & Memories

## Active States & Temporary Configurations
- **Draft App Status**: The Android app is currently in **Draft** mode on the Play Console. 
  - *Implication*: The `Fastfile` explicitly sets `release_status: "draft"` for the `internal` lane. 
  - *Action*: Once the app is fully published to Production, this line should be removed from `android/fastlane/Fastfile` to allow standard release promotions.

## CI/CD Pipeline (`android-release.yml`)
- **Trigger**: Pushing a tag matching `v*.*.*` (e.g., `v1.0.5`).
- **Versioning**:
  - `versionName`: Extracted from the git tag (strips 'v').
  - `versionCode`: Derived from `${{ github.run_number }}`.
    - *Note*: Ensure Fastlane receives this environment variable to apply it.
- **Keystore**: 
  - The workflow expects `KEYSTORE_PATH` to be an **absolute path** (`${{ github.workspace }}/...`). Relative paths cause Gradle signing tasks to fail.

## Secrets Management
The following GitHub Secrets are required for the pipeline:
- `KEYSTORE_BASE64` (Base64 encoded `.jks` file)
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`
- `PLAY_STORE_SERVICE_ACCOUNT` (Base64 encoded JSON key)
