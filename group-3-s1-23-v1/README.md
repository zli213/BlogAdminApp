![Example Image](/public/images/ReadmeFileImage_One.png)
# **The Code Blog**

## Project Summary

The *Code Blog* is an online community platform designed to facilitate open discussions around coding topics. This interactive blog enables users to create unique accounts, post articles, engage with other posts through comments, and even 'like' articles.

## Features

- Account creation with username availability check
- Secure password handling using encryption
- Post articles with a WYSIWYG editor
- Engage with articles through comments and likes
- Subscribe to favorite authors and receive updates
- View comprehensive analytics on your articles
- Adaptive interface for different screen sizes
- Backend API support for future enhancements

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js
- SQLite

### Cloning the Repository

To clone the repository, use the following command:

```bash
git clone https://github.com/UOA-PGCIT-FULLTIME/group-3-s1-23-v1.git
```

### Installing Dependencies

After cloning the project, install the dependencies using npm:

```
cd group-3-s1-23-v1
npm install
```      

#### Database Setup

This application uses SQLite for data storage. In order to set up the database, you need to run an SQL script `project-database-init-script.sql` which is located in the SQL directory of the project's root. Here are the step-by-step instructions:

- Install [DB Browser for SQLite](https://sqlitebrowser.org/dl/) if you haven't already. This is a high quality, open-source tool to design and create SQLite database files, and is available for Windows, MacOS, and Linux.

- Open DB Browser for SQLite and Click on "Open Database".

- Navigate to the root directory of the project and select `project-database.db` file. Once the database is opened, click on the "Execute SQL" tab in DB Browser.

- Click on the folder icon (or "Open file" button) on the top right of the SQL text field. Navigate to the project's root directory and go into the SQL directory.

- Select the `project-database-init-script.sql` file and click on open.

- You should see the SQL commands in the text field. Now, click on the play icon (or "Execute SQL" button).

- You should see a "Query executed successfully" message. This means all tables and data points necessary for the application have been created in your SQLite database, but you need to write the changes before they're in the database

- Click "Write Changes" to save the query from the `project-database-init-script.sql`. Now the database should be ready to go.

#### Setup a `.env` file in the root of your project

In order to properly run this application, you need to setup certain environment variables. Follow these steps to create an `.env` file for storing these variables:

1. In the root directory of your project, create a new file named `.env`.

- On Linux or MacOS, you can use the command `touch .env` in your terminal.

- On Windows, you might have to manually create a new file named `.env` (ensure it's not `.env.txt`).

2. Open the `.env` file using your preferred text editor.

3. Add the necessary environment variables in the following format:

    ```
    SESSION_SECRET=variable_value
    ```

Replace `variable_value` with a randomly generated hash. This variable is necessary for express-session to properly encrypt the sessionId, but the value can be anything.

4. Save and close the `.env` file.

Now, when you run your application with `npm run dev`, these environment variables will be available in the `process.env` object in your Node.js code.

Once this has been set up, you can start the application on port 3000 with:

```
npm start
```

Alternatively users on Macs can serve the application with hot reloading with:

```
npm run dev
```

Because `npm run dev` listens for changes to node files with nodemon and sass files with sass using two different scripts, Windows users will need to run both scripts in separate terminals to achieve the same effect. The two commands for Windows users are: 

```
npm run watch-css
nodemon app.js
```

### Test Credentials

Use the following test credentials to access an account with already-published articles and comments:

```
Username: admin
Password: admin
```

### Additional Information

- There are 5 additional mock test users available in addition to the admin user:  
    - Username: paul123 Password: test1
    - Username: osama123 Password: test2
    - Username: jiseon123 Password: test3
    - Username: tong123 Password: test4
    - Username: zhaohua123 Password: test5
- We've created a few additional handlebars pages beyond the requirements. Those include a coming soon page, as well as 404 and 500 error pages to be displayed if there are issues during browsing. If you wish to view the error pages without intentionally generating an error they can be viewed at `/404` and `/500` respectively.
- The formula we used to calculate the `popularity` index for analytics is `popularity = comments * 2 + total likes`, which must includes at least two independent values.

### Technologies Used

**Client:** HTML, Sass, JavaScript, Chart.js, Quill, 

**Server:** Node, Express, Passport.js, 

**Database:** SQLite

### Authors

[Tong Chen](https://github.com/tche619),
[Paul Highum](https://github.com/paulhighum),
[Osama Khan](https://github.com/osamakhan23),
[Zhaohua Li](https://github.com/zli213),
[Jiseon Yoo](https://github.com/Jiseon-Yoo).

### License

This project is licensed under the MIT license.
