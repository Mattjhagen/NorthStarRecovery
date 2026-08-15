#!/usr/bin/env bash
# Syncs soundscapes/ to the private S3 bucket.
# Run after adding new files: ./aws/sync-soundscapes.sh
# Requires AWS CLI authenticated (aws sso login).

set -euo pipefail

BUCKET="northstar-recovery-soundscapes-soundscapebucket-aoh06vis4c8n"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

echo "Syncing soundscapes → s3://$BUCKET/soundscapes/"

# Sync root soundscapes/ folder (primary)
if [ -d "$REPO/soundscapes" ]; then
  aws s3 sync "$REPO/soundscapes/" "s3://$BUCKET/soundscapes/" \
    --exclude "*.DS_Store" \
    --content-type "audio/wav"
fi

# Also sync assets/soundscapes/ if it has files
if [ -d "$REPO/assets/soundscapes" ]; then
  aws s3 sync "$REPO/assets/soundscapes/" "s3://$BUCKET/soundscapes/" \
    --exclude "*.DS_Store" \
    --content-type "audio/wav"
fi

echo ""
echo "Done. Files are served at:"
echo "  https://d10rkhd3bzdolj.cloudfront.net/soundscapes/<filename>"
