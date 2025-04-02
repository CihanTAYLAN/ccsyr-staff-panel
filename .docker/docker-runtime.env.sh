#!/bin/bash

source .env

escape_regex() {
    local regex="$1"
    echo "$regex" | sed -e 's/[]\/$*.^|[]/\\&/g'
}

declare -a variables=(
    NODE_ENV
    DATABASE_URL
    NEXTAUTH_URL
    NEXTAUTH_SECRET
    MAIL_HOST
    MAIL_PORT
    MAIL_USER
    MAIL_PASSWORD
    MAIL_SECURE
    MAIL_FROM_NAME
    MAIL_FROM_ADDRESS
)

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