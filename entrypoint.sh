#!/bin/sh
set -e
# When /app/data is a bind-mounted host directory the mount point is owned
# by the host user. We create and chown only the subdirectories the app
# needs, so the host retains ownership of the top-level data directory.
mkdir -p /app/data/db /app/data/icons /app/data/wallpapers
chown nextjs:nodejs /app/data/db /app/data/icons /app/data/wallpapers
exec su-exec nextjs node server.js
