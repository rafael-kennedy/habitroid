#!/bin/bash

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed."
    echo "Install it via: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

PROMPTS_FILE="art_prompts.json"
OUTPUT_DIR="src/data/cards"

# Base style rules to prepend to every prompt
STYLE_PREFIX="pixel art, commander keen style, fun zany saturday morning cartoon style, no text, no words, no letters, no speech bubbles, "

echo "Starting Art Generation Batch..."
echo "Total cards to process: $(jq '. | length' $PROMPTS_FILE)"
echo "----------------------------------------"

# Read the JSON array and iterate over each object
jq -c '.[]' "$PROMPTS_FILE" | while read -r item; do
    
    # Extract properties using jq
    card_id=$(echo "$item" | jq -r '.id')
    card_type=$(echo "$item" | jq -r '.type')
    card_prompt=$(echo "$item" | jq -r '.prompt')
    
    full_prompt="${STYLE_PREFIX}${card_prompt}"
    target_path="${OUTPUT_DIR}/${card_type}/${card_id}/image.png"

    echo "==> Generating Art for [${card_type^^}] ${card_id}..."
    echo "Prompt: $full_prompt"
    
    # ---------------------------------------------------------
    # TODO: Add your CLI Image Generation command here!
    # Example:
    # my-gen-cli --prompt "$full_prompt" --out "$target_path"
    # ---------------------------------------------------------

    echo "Sleeping for 40 seconds to respect API rate limits..."
    sleep 40
    echo ""
done

echo "Batch processing complete!"
