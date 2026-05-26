# Student Information Management System

A comprehensive Node.js web application for managing student information with complete CRUD (Create, Read, Update, Delete) functionality. The application is deployed on Render and uses Aiven for cloud database hosting.

## Course Information
- **Course**: IT318 - Web Development
- **Examination Type**: Practical / Hands-on
- **Duration**: 2 Hours
- **Total Points**: 100

## Project Overview

This Student Information Management System is a full-stack web application that allows users to:
- Add student records
- View all student records
- Update student information
- Delete student records

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MySQL (via mysql2/promise)

### Database
- Aiven Cloud Database (MySQL)

### Hosting & Deployment
- Render (Web Application Hosting)
- GitHub (Version Control & Repository)

## Features

### ✨ Core Features
- **Complete CRUD Operations**: Create, Read, Update, Delete student records
- **Cloud Database Integration**: MySQL database hosted on Aiven
- **Cloud Deployment**: Application deployed on Render for public access
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error handling and validation
- **Navigation Menu**: Easy navigation between different pages

### 📋 Student Information Fields
- Student ID (Auto-generated)
- Full Name
- Course
- Year Level (1-4)
- Email Address (unique)

### 🖥️ Frontend Pages
1. **Homepage** (`/`) - Welcome page with features overview
2. **Student Registration Form** (`/register.html`) - Add new students
3. **Student List** (`/list.html`) - View all students with edit/delete options
4. **Edit Student Form** (`/edit.html`) - Update student information

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Aiven account with MySQL database
- Render account
- GitHub account

### Local Development

1. **Clone the Repository**
   ```bash
   git clone <your-github-repo-url>
   cd Bea_Infanso_Final_Exam
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Aiven MySQL Database**
   - Visit [Aiven](https://aiven.io/)
   - Create a new MySQL service
   - Get connection details (host, user, password, database name)

4. **Configure Environment Variables**
   
   Create a `.env` file in the root directory (for local development):
   ```
   PORT=3000
   DB_HOST=your-aiven-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-database-name
   ```

5. **Run the Application Locally**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Or start with node
   npm start
   ```

6. **Access the Application**
   ```
   Open browser and navigate to: http://localhost:3000
   ```

## Deployment to Render

### Step-by-Step Deployment Guide

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Student Management System"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render Dashboard](https://render.com/dashboard)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Select the main branch

3. **Configure Render Service**
   - **Name**: student-management-system
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables in Render**
   - Add the following variables in Render dashboard:
     - `DB_HOST`: mysql-1fc52a22-beainfanso263-c8f7.e.aivencloud.com
     - `DB_USER`: avnadmin
     - `DB_PASSWORD`: AVNS_6ovcwZLwMOsDeS0KZMq
     - `DB_NAME`: student_management
     - `NODE_ENV`: development

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application
   - Once deployment is complete, you'll get a public URL

## API Endpoints

### Base URL
```
https://your-render-deployment-url/api
```

### Endpoints

#### 1. Create Student
- **POST** `/api/students`
- **Body**:
  ```json
  {
    "full_name": "John Doe",
    "course": "Bachelor of Science in Computer Science",
    "year_level": 2,
    "email_address": "john@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Student added successfully",
    "student_id": 1
  }
  ```

#### 2. Get All Students
- **GET** `/api/students`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "student_id": 1,
        "full_name": "John Doe",
        "course": "Bachelor of Science in Computer Science",
        "year_level": 2,
        "email_address": "john@example.com",
        "created_at": "2024-05-26T10:30:00.000Z",
        "updated_at": "2024-05-26T10:30:00.000Z"
      }
    ]
  }
  ```

#### 3. Get Single Student
- **GET** `/api/students/:id`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "student_id": 1,
      "full_name": "John Doe",
      "course": "Bachelor of Science in Computer Science",
      "year_level": 2,
      "email_address": "john@example.com",
      "created_at": "2024-05-26T10:30:00.000Z",
      "updated_at": "2024-05-26T10:30:00.000Z"
    }
  }
  ```

#### 4. Update Student
- **PUT** `/api/students/:id`
- **Body**:
  ```json
  {
    "full_name": "John Doe",
    "course": "Bachelor of Science in Computer Science",
    "year_level": 3,
    "email_address": "john@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Student updated successfully"
  }
  ```

#### 5. Delete Student
- **DELETE** `/api/students/:id`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Student deleted successfully"
  }
  ```

## Database Schema

### Students Table
```sql
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  year_level INT NOT NULL,
  email_address VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Project Structure

```
Bea_Infanso_Final_Exam/
├── package.json
├── crud_final_exam.js
├── README.md
└── public/
    ├── index.html
    ├── register.html
    ├── list.html
    ├── edit.html
    ├── styles.css
    └── script.js
```

## File Descriptions

- **crud_final_exam.js**: Main backend server file with Express.js setup and all CRUD routes
- **public/index.html**: Homepage with features overview
- **public/register.html**: Student registration form
- **public/list.html**: Student list with edit and delete actions
- **public/edit.html**: Student edit form
- **public/styles.css**: Comprehensive CSS styling for all pages
- **public/script.js**: JavaScript for frontend functionality and API calls
- **README.md**: Project documentation

## Error Handling

The application includes comprehensive error handling for:
- Invalid email format
- Missing required fields
- Duplicate email addresses
- Student not found
- Database connection errors
- Validation errors

## Security Considerations

⚠️ **Important**: 
- Database credentials should NEVER be exposed in the public GitHub repository
- Always use environment variables (`.env` file for local development)
- Render automatically handles `.env` through environment variables in the dashboard
- The `.gitignore` file should exclude `.env` to prevent credential exposure

## Testing the Application

1. **Add Student**
   - Go to "Add Student" page
   - Fill in all required fields
   - Click "Add Student"
   - Verify student appears in the list

2. **View Students**
   - Go to "View Students" page
   - Verify all students are displayed in the table

3. **Update Student**
   - Click "Edit" button on any student
   - Modify the information
   - Click "Save Changes"
   - Verify changes are reflected in the list

4. **Delete Student**
   - Click "Delete" button on any student
   - Confirm the deletion
   - Verify student is removed from the list

## Troubleshooting

### Application won't start
- Check if all dependencies are installed: `npm install`
- Verify environment variables are set correctly
- Check Node.js version: `node --version`

### Database connection issues
- Verify Aiven database credentials are correct
- Check if Aiven database is accessible from your location
- Ensure firewall/security groups allow connections

### Deployment issues
- Check Render logs for error messages
- Verify environment variables are set in Render dashboard
- Ensure GitHub repository is public
- Check if build command completes successfully

## Grading Rubric

| Criteria | Points | Status |
|----------|--------|--------|
| Frontend Design and Functionality | 15 | ✓ |
| Backend CRUD Operations | 25 | ✓ |
| Database Integration (Aiven) | 20 | ✓ |
| GitHub Repository Management | 15 | ✓ |
| Render Deployment | 15 | ✓ |
| Documentation and Presentation | 10 | ✓ |
| **TOTAL** | **100** | ✓ |

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Aiven Documentation](https://docs.aiven.io/)
- [Render Documentation](https://render.com/docs/)
- [GitHub Documentation](https://docs.github.com/)

## Author
**Bea Infanso**

## License
ISC

## Course Completion

This project successfully demonstrates:
- ✅ Complete CRUD functionality
- ✅ Database connectivity to cloud database (Aiven)
- ✅ Cloud deployment (Render)
- ✅ Version control using GitHub
- ✅ Responsive web design
- ✅ Error handling and validation
- ✅ Professional documentation

---

**Deployment Link**: https://bea-infanso-final-exam.onrender.com

**GitHub Repository**: https://github.com/beainfanso263-ship-it/Bea_Infanso_Final_Exam

**Last Updated**: May 26, 2024
