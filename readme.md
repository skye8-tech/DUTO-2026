DUTO

A collaborative task and project management web app for students and small teams.

This project was built as a final internship project at Skye8, under the University of Buea programme.

WHAT DUTO DOES

Duto helps people manage personal tasks and group work in one place.

You can:

- Create an account and log in
- Add, edit, delete and search your personal tasks
- Create projects and track progress
- Create teams and invite members by username
- Accept or decline invites
- Assign mini-tasks inside a project
- Leave comments and file name labels on projects
- Receive notifications
- View a dashboard with deadlines, overdue tasks and progress
- Chat with other users
- Use optional tools: notes, calendar, schedule, calculator, pomodoro timer
- Use Duto-AI for study help if you add your own Groq API key

WHO IT IS FOR

- Students working on assignments and group projects
- Small teams that need simple collaboration
- Internship and class demos

TECHNOLOGY USED

- HTML for page structure
- CSS for layout and light/dark theme
- JavaScript for all app logic
- Browser localStorage to save data on the device
- Font Awesome for icons
- Groq API for the optional AI feature (key entered by the user)

HOW TO RUN THE PROJECT

1. Download or open the project folder.or hosted link
2. Open the pages folder. if no link
3. Open login.html or index.html in a browser.
4. For best results, use Live Server in VS Code so all pages load correctly.

You do not need Node.js or a database to run this demo version.

HOW TO TEST WITH TWO USERS

1. Register the first account and create some tasks or a team.
2. Log out.
3. Register a second account with a different username and email.
4. From the first account, invite the second user by username.
5. Log in as the second user and open Notifications to accept the invite.
6. Check that shared projects or teams appear for the second user.
7. Confirm that personal tasks stay private to each account.

MAIN FOLDERS

- pages: all HTML screens
- scripts: JavaScript files for each feature
- styles: CSS files for layout, components and themes
- assets: images and static files if any

IMPORTANT NOTES

- Data is stored in the browser only. Clearing site data removes saved information.
- Different browsers or devices do not share the same data in this demo.
- File sharing stores file names, not real uploaded files.
- Passwords are stored locally for the demo. A real product should use a secure server.
- For Duto-AI, get a free key from the Groq website and save it on the AI page.

FUTURE IMPROVEMENTS

- Connect a backend with Node.js and Express
- Use MongoDB for multi-user and multi-device storage
- Add secure login with hashed passwords
- Support real file uploads
- Host the app online for easier sharing

PROJECT GOAL

The goal of this internship project was to build a working front-end system that covers registration, tasks, projects, teams, invites, progress tracking, notifications and a dashboard using only HTML, CSS and JavaScript.

AUTHOR

Mbakwa Wesley Ambeyang
Internship organisation: Skye8

hosted link https://du-to.netlify.app/
