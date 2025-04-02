#!/bin/bash

source .env

escape_regex() {
    local regex="$1"
    echo "$regex" | sed -e 's/[]\/$*.^|[]/\\&/g'
}

# Read variables from .docker/.docker.env file
if [ -f ".docker/.docker.env" ]; then
    # Extract all variable names from .docker/.docker.env file
    declare -a variables=($(grep -v '^#' .docker/.docker.env | cut -d= -f1 | grep -v '^$'))
    echo "Found ${#variables[@]} environment variables in .docker/.docker.env"
else
    echo "Error: .docker/.docker.env file not found"
    exit 1
fi

for variable in "${variables[@]}"
do
    echo $variable
    find . -type d -name "node_modules" -prune -o -type f \( -name "*.html" -o -name "*.js" -o -name "*.json" \) -print | while read file; do

        temp_file=$(mktemp)
        escaped=$(escape_regex "${!variable}")
        sed "s/${variable}_CHANGE_ME/$escaped/g" "$file" > "$temp_file"

        if [ "$variable" = "NEXT_PUBLIC_BUILD_TIME" ]; then
            sed "s/${variable}_CHANGE_ME/$(date)/g" "$file" > "$temp_file"
        fi

        mv "$temp_file" "$file"
        chmod +rw $file
        echo "File: '$file' updated for env"
    done
    echo "Written env: $variable"
done