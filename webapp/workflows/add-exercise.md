# SETUP
- use puppeter mcp server to steps in workflow
- read USERNAME and PASSWORd from .env.local file
    - If env variables does not exist stop execution and tell the user to verify the file
- setup viewport of the browser to run on an iphone 15 pro max

### WORKFLOW
- navigate to localhost:3000/auth/login
- enter username and password
- click Log In
- click "+ Create workout" button
- select "Leg" muscle group
- write "test leg" in the "Exercise Name" input
- wait 3 seconds until the dropdown appear
- select "test leg Leg" from the dropdown results
- write performace data
    - click "Add Set" button
    - write 15 reps in "Reps" input
    - write 100 in the "Weight (kg)" input
    - click "Add Set" button
    - repeat this 4 times
- click "Log Exercise" button
- wait until the log is registerd and the app take you back to the /dashboard page
- take a screnshoot of the homepage and store it in screenshots folder
    - if the folder does not exist create it
- close the brows
