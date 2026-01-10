# Command: run-webapp-workflow

Run worflows files that are located in the webapp/workflows folder.

## Steps
- navigate to webapp directory
- verify if the file $ARGUMENTS.md
    - if the file exists continue to next step
    - if the files DOES NOT exist stop the execution and tell the user to verify the file name
- execute the file with the name $ARGUMENTS.md
