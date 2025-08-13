#!/bin/bash

# This script zips the contents of the browser_extension directory
# into a file named upload.zip in the root of the project.

# Define the source directory and the output file
SOURCE_DIR="."
OUTPUT_FILE="upload.zip"

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Directory $SOURCE_DIR not found."
  exit 1
fi

# Navigate into the source directory
cd "$SOURCE_DIR" || exit

# Zip the contents of the directory. The -r flag is for recursive zipping.
# The ./* ensures that the files are zipped without the parent directory structure.
zip -r "$OUTPUT_FILE" ./*

echo "Extension successfully zipped to $OUTPUT_FILE"
