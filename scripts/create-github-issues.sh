#!/bin/bash

# Script to create GitHub issues for settings refactoring
# Uses SSH key authentication via GitHub CLI or SSH agent
# Usage: ./scripts/create-github-issues.sh

REPO_SSH="git@github.com:sjlouji/friday.git"
REPO="sjlouji/friday"
API_URL="https://api.github.com/repos/${REPO}/issues"

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
  USE_GH_CLI=true
  echo "Using GitHub CLI (gh) for authentication..."
  if ! gh auth status &> /dev/null; then
    echo "Error: GitHub CLI not authenticated"
    echo "Please run: gh auth login"
    exit 1
  fi
else
  USE_GH_CLI=false
  echo "GitHub CLI not found. Using SSH key authentication..."
  
  # Check for SSH key in common locations
  SSH_KEY=""
  if [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY="$HOME/.ssh/id_ed25519"
  elif [ -f "$HOME/.ssh/id_rsa" ]; then
    SSH_KEY="$HOME/.ssh/id_rsa"
  elif [ -f "$HOME/.ssh/id_ecdsa" ]; then
    SSH_KEY="$HOME/.ssh/id_ecdsa"
  fi
  
  if [ -z "$SSH_KEY" ]; then
    echo "Error: No SSH key found"
    echo "Please ensure you have an SSH key set up, or install GitHub CLI:"
    echo "  brew install gh"
    echo "  gh auth login"
    exit 1
  fi
  
  # Check if SSH agent is running and has the key loaded
  if ! ssh-add -l &> /dev/null; then
    echo "Warning: SSH agent not running or key not loaded"
    echo "Attempting to add SSH key to agent..."
    ssh-add "$SSH_KEY" 2>/dev/null || {
      echo "Error: Failed to add SSH key to agent"
      echo "Please run: ssh-add $SSH_KEY"
      exit 1
    }
  fi
  
  # Try to get token from GitHub using SSH
  # Note: This requires a GitHub personal access token
  # For SSH-only auth, we need to use gh CLI or provide token via environment
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN not set and GitHub CLI not available"
    echo "Options:"
    echo "  1. Install GitHub CLI: brew install gh && gh auth login"
    echo "  2. Set GITHUB_TOKEN environment variable"
    echo "     Create token at: https://github.com/settings/tokens"
    exit 1
  fi
fi

create_issue_gh() {
  local title="$1"
  local body="$2"
  local labels="$3"
  
  # Convert labels from JSON array format to space-separated
  local label_list=$(echo "$labels" | sed 's/\[//g' | sed 's/\]//g' | sed 's/"//g' | sed 's/,/ /g')
  
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$label_list" \
    --output json | jq -r '.number'
}

create_issue_api() {
  local title="$1"
  local body="$2"
  local labels="$3"
  
  curl -X POST "${API_URL}" \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{
      \"title\": \"${title}\",
      \"body\": \"${body}\",
      \"labels\": [${labels}]
    }" | jq -r '.number'
}

create_issue() {
  if [ "$USE_GH_CLI" = true ]; then
    create_issue_gh "$@"
  else
    create_issue_api "$@"
  fi
}

echo "Creating GitHub issues for repository: ${REPO_SSH}"
echo ""

# Issue 1: Create Settings Type Definitions and Store Structure
ISSUE_1=$(create_issue \
  "Create Settings Type Definitions and Store Structure" \
  "## Description
Create comprehensive TypeScript type definitions for all settings categories:
- AppearanceSettings (language, locale, theme, table preferences, UI options)
- WorkspaceSettings (currency, date/time, fiscal year, file paths)
- BookkeepingSettings (Beancount options, Fava options, account settings, import/export)

Update the settings store to support these new types with proper defaults and migration from old format.

## Acceptance Criteria
- [ ] Type definitions created in \`app/src/modules/settings/types/index.ts\`
- [ ] Settings store updated to use new types
- [ ] Migration logic for old settings format
- [ ] Default values for all settings" \
  "\"enhancement\", \"settings\"")

echo "Created issue #${ISSUE_1}"

# Issue 2: Implement Tabs Component Structure for Settings
ISSUE_2=$(create_issue \
  "Implement Tabs Component Structure for Settings" \
  "## Description
Refactor the Settings page to use Cloudscape Tabs component with three main tabs:
1. Appearance
2. Workspace Settings  
3. Bookkeeping Configuration

## Acceptance Criteria
- [ ] Settings page uses Cloudscape Tabs
- [ ] Three tabs properly structured
- [ ] Tab state management
- [ ] Responsive layout" \
  "\"enhancement\", \"settings\", \"ui\"")

echo "Created issue #${ISSUE_2}"

# Issue 3: Build Appearance Tab
ISSUE_3=$(create_issue \
  "Build Appearance Tab (Language, Theme, Table Preferences)" \
  "## Description
Create the Appearance tab component with:
- Language selection (with locale)
- Theme selection (light/dark/auto)
- Table preferences (content density, wrap lines, sticky columns, column reordering)
- UI appearance options (indent, currency column, color inversion options)
- Account display options (zero balance, zero transactions, closed accounts)

## Acceptance Criteria
- [ ] Appearance tab component created
- [ ] All appearance settings functional
- [ ] Real-time preview where applicable
- [ ] Proper form validation" \
  "\"enhancement\", \"settings\", \"ui\"")

echo "Created issue #${ISSUE_3}"

# Issue 4: Build Workspace Settings Tab
ISSUE_4=$(create_issue \
  "Build Workspace Settings Tab (Currency, Date/Time, Fiscal Year)" \
  "## Description
Create the Workspace Settings tab with:
- Currency settings (default currency, conversion currency, conversion currencies)
- Date/Time settings (date format, time format, fiscal year start/end)
- File settings (default file, default page, auto-reload, external editor)
- Localization (locale, language)

## Acceptance Criteria
- [ ] Workspace tab component created
- [ ] All workspace settings functional
- [ ] Currency selection with comprehensive list
- [ ] Date format options
- [ ] Fiscal year configuration" \
  "\"enhancement\", \"settings\"")

echo "Created issue #${ISSUE_4}"

# Issue 5: Build Bookkeeping Configuration Tab
ISSUE_5=$(create_issue \
  "Build Bookkeeping Configuration Tab (Beancount & Fava Options)" \
  "## Description
Create the Bookkeeping Configuration tab with all Beancount and Fava options:
- Account settings (journal include children, account naming, account types)
- Import/Export settings (import config, import dirs, insert entry, collapse pattern)
- Beancount core options (booking method, commodities, display precision, etc.)
- Fava-specific options (sidebar queries, upcoming events, etc.)

Organize into collapsible sections for better UX.

## Acceptance Criteria
- [ ] Bookkeeping tab component created
- [ ] All Beancount options implemented
- [ ] All Fava options implemented
- [ ] Organized into logical sections
- [ ] Help text for complex options" \
  "\"enhancement\", \"settings\", \"beancount\"")

echo "Created issue #${ISSUE_5}"

# Issue 6: Implement Settings Persistence and Migration
ISSUE_6=$(create_issue \
  "Implement Settings Persistence and Migration" \
  "## Description
Implement robust settings persistence:
- Migrate from old \`beancount-settings\` localStorage format
- Handle missing or corrupted settings gracefully
- Version settings schema for future migrations
- Export/import settings functionality

## Acceptance Criteria
- [ ] Migration from old format works
- [ ] Settings persist correctly
- [ ] Error handling for corrupted data
- [ ] Export/import functionality
- [ ] Settings versioning" \
  "\"enhancement\", \"settings\", \"data\"")

echo "Created issue #${ISSUE_6}"

# Issue 7: Add UI/UX Enhancements
ISSUE_7=$(create_issue \
  "Add UI/UX Enhancements (Help Text, Reset, Search)" \
  "## Description
Add UX improvements to the Settings page:
- Help text/info links for complex settings
- Reset to defaults button
- Search/filter settings
- Settings validation and error messages
- Success notifications

## Acceptance Criteria
- [ ] Help text for all complex options
- [ ] Reset functionality
- [ ] Search/filter (if many settings)
- [ ] Proper validation
- [ ] User feedback for changes" \
  "\"enhancement\", \"settings\", \"ux\"")

echo "Created issue #${ISSUE_7}"

# Issue 8: Integrate Settings Throughout Application
ISSUE_8=$(create_issue \
  "Integrate Settings Throughout Application" \
  "## Description
Ensure all settings are used throughout the application:
- Currency formatting uses workspace currency settings
- Date formatting uses workspace date format
- Theme changes apply immediately
- Language changes apply immediately
- Table preferences used in all tables
- Beancount settings passed to backend

## Acceptance Criteria
- [ ] Currency settings used everywhere
- [ ] Date format used everywhere
- [ ] Theme applies immediately
- [ ] Language applies immediately
- [ ] Table preferences applied
- [ ] Backend receives Beancount settings" \
  "\"enhancement\", \"settings\", \"integration\"")

echo "Created issue #${ISSUE_8}"

echo ""
echo "All issues created successfully!"
echo "Issue numbers: ${ISSUE_1}, ${ISSUE_2}, ${ISSUE_3}, ${ISSUE_4}, ${ISSUE_5}, ${ISSUE_6}, ${ISSUE_7}, ${ISSUE_8}"
echo ""
echo "View issues at: https://github.com/${REPO}/issues"
