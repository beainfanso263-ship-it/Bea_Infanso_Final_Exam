// API Base URL
const API_BASE_URL = window.location.origin + '/api';

// Common utility functions
const showAlert = (message, type = 'info') => {
    const alertDiv = document.getElementById('alert');
    if (alertDiv) {
        alertDiv.className = `alert alert-${type} show`;
        alertDiv.textContent = message;
        setTimeout(() => {
            alertDiv.classList.remove('show');
        }, 4000);
    }
};

const showLoading = (show = true) => {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = show ? 'block' : 'none';
    }
};

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Form submission handler (for registration and edit forms)
const handleFormSubmit = async (e, formId, isEditMode = false, studentId = null) => {
    e.preventDefault();
    
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validation
    if (!data.full_name || !data.course || !data.year_level || !data.email_address) {
        showAlert('All fields are required', 'error');
        return;
    }

    if (!validateEmail(data.email_address)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    if (isNaN(data.year_level) || data.year_level < 1 || data.year_level > 4) {
        showAlert('Year level must be between 1 and 4', 'error');
        return;
    }

    showLoading(true);

    try {
        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode 
            ? `${API_BASE_URL}/students/${studentId}` 
            : `${API_BASE_URL}/students`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert(result.message, 'success');
            form.reset();
            
            if (!isEditMode) {
                setTimeout(() => {
                    window.location.href = '/list.html';
                }, 1500);
            } else {
                setTimeout(() => {
                    window.location.href = '/list.html';
                }, 1500);
            }
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
};

// Get all students
const fetchStudents = async () => {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            showAlert('Failed to fetch students', 'error');
            return [];
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        showAlert('Error fetching students', 'error');
        return [];
    } finally {
        showLoading(false);
    }
};

// Get single student by ID
const fetchStudent = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            showAlert('Student not found', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        showAlert('Error fetching student', 'error');
        return null;
    }
};

// Display students in table
const displayStudents = (students) => {
    const tableBody = document.getElementById('studentsTableBody');
    
    if (!tableBody) return;

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No students found. <a href="/register.html">Add a new student</a></td></tr>';
        return;
    }

    tableBody.innerHTML = students.map(student => `
        <tr>
            <td>${student.student_id}</td>
            <td>${student.full_name}</td>
            <td>${student.course}</td>
            <td>${student.year_level}</td>
            <td>${student.email_address}</td>
            <td>
                <div class="action-buttons">
                    <a href="/edit.html?id=${student.student_id}" class="btn btn-edit">Edit</a>
                    <button class="btn btn-danger" onclick="deleteStudent(${student.student_id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Delete student
const deleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Student deleted successfully', 'success');
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showAlert('Error deleting student', 'error');
    } finally {
        showLoading(false);
    }
};

// Load student data for edit form
const loadStudentForEdit = async (id) => {
    showLoading(true);
    const student = await fetchStudent(id);
    showLoading(false);

    if (student) {
        document.getElementById('fullName').value = student.full_name;
        document.getElementById('course').value = student.course;
        document.getElementById('yearLevel').value = student.year_level;
        document.getElementById('emailAddress').value = student.email_address;
    } else {
        setTimeout(() => {
            window.location.href = '/list.html';
        }, 2000);
    }
};

// Initialize page on load
const initializePage = async () => {
    const path = window.location.pathname;

    if (path === '/list.html' || path === '/') {
        const students = await fetchStudents();
        if (students.length > 0) {
            displayStudents(students);
        }
    }

    if (path === '/edit.html') {
        const params = new URLSearchParams(window.location.search);
        const studentId = params.get('id');
        
        if (!studentId) {
            showAlert('Invalid student ID', 'error');
            setTimeout(() => {
                window.location.href = '/list.html';
            }, 2000);
        } else {
            loadStudentForEdit(studentId);
        }
    }
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
