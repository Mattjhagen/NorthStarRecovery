#!/usr/bin/env bash
# Syncs assets/soundscapes/ to the private S3 bucket.
# Run after adding new files: ./aws/sync-soundscapes.sh
# Requires AWS CLI authenticated (aws sso login).

set -euo pipefail

BUCKET="northstar-recovery-soundscapes-soundscapebucket-aoh06vis4c8n"
LOCAL="$(cd "$(dirname "$0")/.." && pwd)/assets/soundscapes"

echo "Syncing $LOCAL → s3://$BUCKET/soundscapes/"

aws s3 sync "$LOCAL" "s3://$BUCKET/soundscapes/" \
  --delete \
  --exclude "*.DS_Store" \
  --content-type "audio/wav"

echo ""
echo "Done. Files are served at:"
echo "  https://d10rkhd3bzdolj.cloudfront.net/soundscapes/<filename>"
