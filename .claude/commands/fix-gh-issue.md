# Command
fix github issue

## Description
This command will create a plan and implement a fix for the Github issue the user passes as parameter

## Arguments
- $ARGUMENTS: GitHub issue number or URL

### Steps
1. Fetch issue details using `gh issue view $ARGUMENTS`
2. Analyze issue: title, description, labels, comments
3. Search codebase for relevant files mentioned or implied by issue
4. Create plan with:
   - Root cause analysis
   - Files to modify
   - Implementation approach
   - Testing strategy
5. Ask user to approve plan before proceeding
6. Create feature branch: `git checkout -b fix/issue-$ARGUMENTS`
7. Implement fix following the approved plan
8. Run tests and linting to verify fix
9. Commit changes with message referencing issue: `Fixes #$ARGUMENTS`
10. Push branch and create PR linking to issue
