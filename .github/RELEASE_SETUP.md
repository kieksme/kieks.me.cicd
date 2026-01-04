# Release Setup Instructions

## Initial Release Setup

Since release-please requires an existing release to work properly, you need to create an initial release manually:

1. **Create and push the initial tag:**

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Create the initial release on GitHub:**
   - Go to the repository on GitHub
   - Navigate to "Releases" → "Draft a new release"
   - Select tag `v0.1.0`
   - Add release title: "v0.1.0 - Initial Release"
   - Add release notes (optional)
   - Click "Publish release"

After the initial release is created, release-please will automatically create release PRs for future changes.

## Future Releases

Once the initial release is set up, release-please will:

- Automatically create release PRs when you push to `main`
- Merge the release PR to create a new release
- The `release.yml` workflow will then package and upload all assets

## Commit Message Format

While release-please works best with Conventional Commits, the `simple` release-type is more flexible. However, for better release notes, consider using Conventional Commits format:

- `feat: Add new logo variant`
- `fix: Update color palette`
- `docs: Update guidelines`
