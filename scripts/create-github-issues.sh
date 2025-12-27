#!/bin/bash

# Script to create GitHub issues for settings refactoring
# Usage: GITHUB_TOKEN=your_token ./scripts/create-github-issues.sh

REPO="sjlouji/friday"
API_URL="https://api.github.com/repos/${REPO}/issues"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set"
  echo "Usage: GITHUB_TOKEN=your_token ./scripts/create-github-issues.sh"
  exit 1
fi

create_issue() {
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

echo "Creating GitHub issues..."

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

