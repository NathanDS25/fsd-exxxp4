const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(morgan('combined'));
app.use(express.json());
app.use(cors());

// Students array (simulated database) - last is "current"
let students = [{
  name: 'John Doe',
  rollNumber: 23,
  course: 'Computer Engineering',
  email: 'john.doe@university.edu',
  contact: '+1-234-567-8900'
}];

const getCurrentStudent = () => students[students.length - 1];

// Routes

// GET / - Welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Student Information Server',
    status: 'Server is running'
  });
});

// GET /about - Student info (current/last)
app.get('/about', (req, res) => {
  const current = getCurrentStudent();
  if (!current) return res.status(404).json(null);
  
  res.json({
    name: current.name,
    rollNumber: current.rollNumber,
    course: current.course
  });
});

// GET /contact - Contact information (current/last)
app.get('/contact', (req, res) => {
  const current = getCurrentStudent();
  if (!current) return res.status(404).json(null);
  
  res.json({
    email: current.email,
    contact: current.contact
  });
});

// POST /register - Register new student (add to array)
app.post('/register', (req, res) => {
  const { name, rollNumber, course, email, contact } = req.body;

  if (!name || !rollNumber || !course) {
    return res.status(400).json({
      status: 400,
      message: 'Missing required fields: name, rollNumber, course'
    });
  }

  const newStudent = {
    name,
    rollNumber: parseInt(rollNumber),
    course,
    ...(email && {email }),
    ...(contact && {contact})
  };

  students.push(newStudent);

  res.status(201).json({
    status: 201,
    message: 'Created',
    data: newStudent
  });
});

// PUT /update - Update current student (last in array)
app.put('/update', (req, res) => {
  const { name, rollNumber, course, email, contact } = req.body;

  if (students.length === 0) {
    return res.status(404).json({
      status: 404,
      message: 'No student found to update'
    });
  }

  const currentIndex = students.length - 1;
  const currentStudent = students[currentIndex];

  if (name !== undefined) currentStudent.name = name;
  if (rollNumber !== undefined) currentStudent.rollNumber = parseInt(rollNumber);
  if (course !== undefined) currentStudent.course = course;
  if (email !== undefined) currentStudent.email = email;
  if (contact !== undefined) currentStudent.contact = contact;

  students[currentIndex] = currentStudent;

  res.status(200).json({
    status: 200,
    message: 'Updated',
    data: currentStudent
  });
});

// GET /all - Get all students array
app.get('/all', (req, res) => {
  res.json({
    status: 200,
    message: 'All students fetched',
    data: students
  });
});

// DELETE /delete - Delete last/current student
app.delete('/delete', (req, res) => {
  if (students.length > 0) {
    students.pop();
  }
  const current = students.length > 0 ? getCurrentStudent() : null;
  res.status(200).json({
    status: 200,
    message: 'Student deleted successfully',
    data: current
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
