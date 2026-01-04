# Release Setup Instructions

## Initial Release Setup

**Important:** release-please requires an existing release to work properly. You need to create an initial release manually before the automated workflow can function.

### Step 1: Create and push the initial tag

```bash
git tag v0.1.0
git push origin v0.1.0
```

### Step 2: Create the initial release on GitHub

1. Go to the repository on GitHub
2. Navigate to "Releases" → "Draft a new release"
3. Select tag `v0.1.0`
4. Add release title: "v0.1.0 - Initial Release"
5. Add release notes (you can use the content from RELEASE_README.md template)
6. Click "Publish release"

### Step 3: Verify the release

After publishing, verify that:

- The release appears in the Releases section
- The tag `v0.1.0` is visible
- The `.release-please-manifest.json` file contains `".": "0.1.0"`

## Future Releases

Once the initial release is set up, release-please will:

- Automatically create release PRs when you push to `main` (if there are changes)
- You can merge the release PR to create a new release
- The `release.yml` workflow will automatically package and upload all assets

## Commit Message Format

The `simple` release-type is flexible and works with any commit messages. However, for better release notes and automatic version bumping, consider using Conventional Commits format:

- `feat: Add new logo variant` - Creates a minor version bump
- `fix: Update color palette` - Creates a patch version bump
- `docs: Update guidelines` - No version bump (documentation only)
- `feat!: Breaking change` - Creates a major version bump

## Troubleshooting

If release-please fails with commit parsing errors:

- This is normal for the initial setup before the first release exists
- Create the initial release manually as described above
- Future releases will work automatically

If you see JSON parsing errors:

- Ensure `.release-please-manifest.json` is valid JSON
- The file should contain: `{ ".": "0.1.0" }`
- No trailing commas or extra characters
