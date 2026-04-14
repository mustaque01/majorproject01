#!/bin/bash

# Instructor Backend Testing Script
# Provides interactive testing of all instructor endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5000/api"
TOKEN=""
ACCESS_TOKEN=""

# Menu functions
show_menu() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}  Instructor Backend API Testing${NC}"
    echo -e "${BLUE}================================================${NC}\n"
    
    echo -e "${YELLOW}PHASE 1: Authentication${NC}"
    echo "1. Register as Instructor"
    echo "2. Login as Instructor"
    echo "3. Set Token Manually"
    
    echo -e "\n${YELLOW}PHASE 2: Instructor Profile${NC}"
    echo "4. Get My Profile"
    echo "5. Update My Profile"
    
    echo -e "\n${YELLOW}PHASE 3: Course Management${NC}"
    echo "6. Create New Course"
    echo "7. Get My Courses"
    echo "8. Update Course"
    echo "9. Publish Course"
    echo "10. Unpublish Course"
    echo "11. Delete Course"
    
    echo -e "\n${YELLOW}PHASE 4: Analytics & Dashboard${NC}"
    echo "12. Get Dashboard"
    echo "13. Get Course Analytics"
    echo "14. Get Performance Summary"
    echo "15. Get Earnings Report"
    echo "16. Get Reviews"
    
    echo -e "\n${YELLOW}UTILITIES${NC}"
    echo "17. Show Current Token"
    echo "18. Check Server Status"
    echo "0. Exit"
    
    echo -e "\n${BLUE}Select an option:${NC} "
}

# Color print functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Utility functions
check_server() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/../)
    if [ "$response" == "200" ]; then
        print_success "Server is running"
    else
        print_error "Server is not responding (HTTP $response)"
    fi
}

show_token() {
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set"
    else
        echo -e "${BLUE}Current Token:${NC}"
        echo "$ACCESS_TOKEN"
        echo -e "\n${BLUE}Token Expiry Info:${NC}"
        node -e "try { console.log(JSON.stringify(require('jsonwebtoken').decode('$ACCESS_TOKEN'), null, 2)); } catch(e) { console.log('Invalid token'); }" 2>/dev/null || echo "Could not decode token"
    fi
}

# Authentication functions
register_instructor() {
    echo -e "\n${BLUE}=== Register as Instructor ===${NC}"
    
    read -p "First Name: " firstName
    read -p "Last Name: " lastName
    read -p "Email: " email
    read -p "Password: " password
    read -p "Specialization (e.g., Web Development): " specialization
    
    print_info "Registering instructor..."
    
    response=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"firstName\": \"$firstName\",
            \"lastName\": \"$lastName\",
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"role\": \"instructor\",
            \"specialization\": \"$specialization\",
            \"institution\": \"Test University\"
        }")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # Extract token
    token=$(echo "$response" | jq -r '.data.accessToken' 2>/dev/null)
    if [ "$token" != "null" ] && [ ! -z "$token" ]; then
        ACCESS_TOKEN=$token
        print_success "Token saved. You can now use other endpoints."
    fi
}

login_instructor() {
    echo -e "\n${BLUE}=== Login as Instructor ===${NC}"
    
    read -p "Email: " email
    read -p "Password: " password
    
    print_info "Logging in..."
    
    response=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"role\": \"instructor\"
        }")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # Extract token
    token=$(echo "$response" | jq -r '.data.accessToken' 2>/dev/null)
    if [ "$token" != "null" ] && [ ! -z "$token" ]; then
        ACCESS_TOKEN=$token
        print_success "Login successful. Token saved."
    fi
}

set_token_manual() {
    echo -e "\n${BLUE}=== Set Token Manually ===${NC}"
    read -p "Paste your access token: " ACCESS_TOKEN
    print_success "Token set"
}

# Profile functions
get_profile() {
    echo -e "\n${BLUE}=== Get My Profile ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    curl -s -X GET "$API_URL/instructor/profile" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

update_profile() {
    echo -e "\n${BLUE}=== Update My Profile ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Years of Experience: " yearsOfExperience
    read -p "Bio: " bio
    read -p "Skills (comma separated, e.g., React,Node.js): " skills
    
    # Convert comma-separated skills to JSON array
    skillsArray=$(echo "$skills" | jq -R 'split(",")')
    
    curl -s -X PUT "$API_URL/instructor/profile" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"yearsOfExperience\": $yearsOfExperience,
            \"bio\": \"$bio\",
            \"skills\": $skillsArray
        }" | jq '.'
}

# Course functions
create_course() {
    echo -e "\n${BLUE}=== Create New Course ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Course Title: " title
    read -p "Description: " description
    read -p "Category ID (use 'demo' for default): " categoryId
    read -p "Duration (e.g., 42.5 hours): " duration
    read -p "Level (Beginner/Intermediate/Advanced): " level
    read -p "Price: " price
    
    if [ "$categoryId" == "demo" ]; then
        categoryId="507f1f77bcf86cd799439001"
    fi
    
    curl -s -X POST "$API_URL/instructor/courses" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"$title\",
            \"description\": \"$description\",
            \"categoryId\": \"$categoryId\",
            \"duration\": \"$duration\",
            \"level\": \"$level\",
            \"price\": $price,
            \"topics\": [\"Topic 1\", \"Topic 2\"],
            \"skills\": [\"Skill 1\", \"Skill 2\"],
            \"difficulty\": 5,
            \"certification\": {\"offered\": true}
        }" | jq '.'
}

get_courses() {
    echo -e "\n${BLUE}=== Get My Courses ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Status (active/draft, leave empty for all): " status
    
    if [ -z "$status" ]; then
        curl -s -X GET "$API_URL/instructor/courses" \
            -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    else
        curl -s -X GET "$API_URL/instructor/courses?status=$status" \
            -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    fi
}

update_course() {
    echo -e "\n${BLUE}=== Update Course ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Course ID: " courseId
    read -p "New Title (leave empty to skip): " title
    read -p "New Price (leave empty to skip): " price
    
    data="{"
    [ ! -z "$title" ] && data="$data\"title\": \"$title\","
    [ ! -z "$price" ] && data="$data\"price\": $price,"
    data="${data%,}" # Remove trailing comma
    data="$data}"
    
    curl -s -X PUT "$API_URL/instructor/courses/$courseId" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data" | jq '.'
}

publish_course() {
    echo -e "\n${BLUE}=== Publish Course ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Course ID: " courseId
    
    curl -s -X POST "$API_URL/instructor/courses/$courseId/publish" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

unpublish_course() {
    echo -e "\n${BLUE}=== Unpublish Course ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Course ID: " courseId
    
    curl -s -X POST "$API_URL/instructor/courses/$courseId/unpublish" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

delete_course() {
    echo -e "\n${BLUE}=== Delete Course ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Course ID: " courseId
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" == "yes" ]; then
        curl -s -X DELETE "$API_URL/instructor/courses/$courseId" \
            -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    else
        print_info "Cancelled"
    fi
}

# Analytics functions
get_dashboard() {
    echo -e "\n${BLUE}=== Get Dashboard ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    curl -s -X GET "$API_URL/instructor/dashboard" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

get_course_analytics() {
    echo -e "\n${BLUE}=== Get Course Analytics ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Course ID: " courseId
    
    curl -s -X GET "$API_URL/instructor/courses/$courseId/analytics" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

get_performance() {
    echo -e "\n${BLUE}=== Get Performance Summary ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    curl -s -X GET "$API_URL/instructor/performance-summary" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

get_earnings() {
    echo -e "\n${BLUE}=== Get Earnings Report ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    read -p "Period (daily/weekly/monthly/yearly): " period
    
    curl -s -X GET "$API_URL/instructor/earnings?period=$period" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

get_reviews() {
    echo -e "\n${BLUE}=== Get Reviews ===${NC}"
    
    if [ -z "$ACCESS_TOKEN" ]; then
        print_error "No token set. Please login first."
        return
    fi
    
    curl -s -X GET "$API_URL/instructor/reviews?page=1&limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

# Main loop
while true; do
    show_menu
    read -p "" choice
    
    case $choice in
        1) register_instructor ;;
        2) login_instructor ;;
        3) set_token_manual ;;
        4) get_profile ;;
        5) update_profile ;;
        6) create_course ;;
        7) get_courses ;;
        8) update_course ;;
        9) publish_course ;;
        10) unpublish_course ;;
        11) delete_course ;;
        12) get_dashboard ;;
        13) get_course_analytics ;;
        14) get_performance ;;
        15) get_earnings ;;
        16) get_reviews ;;
        17) show_token ;;
        18) check_server ;;
        0) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
        *) print_error "Invalid option" ;;
    esac
done
