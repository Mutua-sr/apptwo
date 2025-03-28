#!/bin/bash

# Base URL
BASE_URL="http://localhost:8000/api"

# Student names array (50 entries)
declare -a STUDENT_FIRST_NAMES=(
    "Emma" "James" "Liam" "Olivia" "Noah" "Ava" "Ethan" "Sophia" "Mason" "Isabella"
    "Lucas" "Mia" "Alexander" "Charlotte" "William" "Amelia" "Henry" "Harper" "Sebastian" "Evelyn"
    "Jack" "Abigail" "Owen" "Emily" "Daniel" "Elizabeth" "Michael" "Sofia" "Matthew" "Avery"
    "Benjamin" "Ella" "Aiden" "Scarlett" "Jackson" "Victoria" "Samuel" "Madison" "David" "Luna"
    "Joseph" "Grace" "Carter" "Chloe" "John" "Penelope" "Luke" "Layla" "Isaac" "Zoe"
)

declare -a STUDENT_LAST_NAMES=(
    "Thompson" "Wilson" "Parker" "Chen" "Davis" "Brown" "Lee" "Kim" "Wright" "Patel"
    "Anderson" "Martinez" "Johnson" "Zhang" "Taylor" "White" "Harris" "Garcia" "Miller" "Jones"
    "Clark" "Rodriguez" "Lewis" "King" "Young" "Scott" "Green" "Baker" "Adams" "Nelson"
    "Hill" "Ramirez" "Campbell" "Mitchell" "Roberts" "Carter" "Phillips" "Evans" "Turner" "Torres"
    "Parker" "Collins" "Edwards" "Stewart" "Morris" "Murphy" "Rivera" "Cook" "Rogers" "Morgan"
)

# Lecturer names array (8 entries)
declare -a LECTURER_FIRST_NAMES=(
    "David" "Sarah" "Michael" "Jennifer" "Robert" "Elizabeth" "William" "Maria"
)

declare -a LECTURER_LAST_NAMES=(
    "Anderson" "Martinez" "Johnson" "Zhang" "Taylor" "White" "Harris" "Garcia"
)

echo "# Create Students"
echo

# Generate student curl commands
for i in "${!STUDENT_FIRST_NAMES[@]}"; do
    RANDOM_PASS=$(printf "%06d" $((RANDOM % 1000000)))
    echo "# Student $((i+1))"
    echo "curl -X POST \"\${BASE_URL}/auth/register\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{"
    echo "    \"name\": \"${STUDENT_FIRST_NAMES[i]}\"\"${STUDENT_LAST_NAMES[i]}\","
    echo "    \"email\": \"${STUDENT_FIRST_NAMES[i],,}.${STUDENT_LAST_NAMES[i]:0:1}@uniapp.edu\","
    echo "    \"password\": \"St${RANDOM_PASS}!\","
    echo "    \"role\": \"student\""
    echo "  }'"
    echo
done

echo "# Create Lecturers"
echo

# Generate lecturer curl commands
for i in "${!LECTURER_FIRST_NAMES[@]}"; do
    RANDOM_PASS=$(printf "%06d" $((RANDOM % 1000000)))
    echo "# Lecturer $((i+1))"
    echo "curl -X POST \"\${BASE_URL}/auth/register\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{"
    echo "    \"name\": \"${LECTURER_FIRST_NAMES[i]}\" \"${LECTURER_LAST_NAMES[i]}\","
    echo "    \"email\": \"${LECTURER_FIRST_NAMES[i],,}.${LECTURER_LAST_NAMES[i],,}@uniapp.edu\","
    echo "    \"password\": \"Lc${RANDOM_PASS}!\","
    echo "    \"role\": \"lecturer\""
    echo "  }'"
    echo
done 

