import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:4000'

function App() {
  const [studentInfo, setStudentInfo] = useState(null)
  const [contactInfo, setContactInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState('home')
  const [allStudents, setAllStudents] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    course: '',
    email: '',
    contact: ''
  })

  // Fetch student info
  const fetchStudentInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/about`)
      const data = await response.json()
      setStudentInfo(data)
      setMessage('')
    } catch (error) {
      setMessage('Error fetching student info: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch contact info
  const fetchContactInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/contact`)
      const data = await response.json()
      setContactInfo(data)
      setMessage('')
    } catch (error) {
      setMessage('Error fetching contact info: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all students
  const fetchAllStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/all`)
      const data = await response.json()
      setAllStudents(data.data || [])
      setMessage('')
    } catch (error) {
      setMessage('Error fetching students: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete student
  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/delete`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✓ Student deleted successfully!')
        setStudentInfo(data.data || null)
        if (data.data) {
          setContactInfo({
            email: data.data.email,
            contact: data.data.contact
          })
        } else {
          setContactInfo(null)
        }
        setShowDeleteConfirm(false)
        // Reset allStudents with empty if no data
        setAllStudents(data.data ? [data.data] : [])
        setActiveSection('home')
      } else {
        setMessage('✗ Delete failed: ' + data.message)
      }
    } catch (error) {
      setMessage('✗ Error deleting student: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Register student
  const handleRegister = async (e) => {
    e.preventDefault()

    // Trim whitespace
    const trimmedName = formData.name.trim()
    const trimmedCourse = formData.course.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedContact = formData.contact.trim()

    // Check for blank/empty fields
    if (!trimmedName || !formData.rollNumber || !trimmedCourse) {
      setMessage('✗ Please fill in all required fields without blank spaces')
      return
    }

    // Validate that name and course are not just whitespace
    if (trimmedName.length === 0 || trimmedCourse.length === 0) {
      setMessage('✗ Name and Course cannot be empty or contain only spaces')
      return
    }

    // Validate phone number if provided
    if (trimmedContact && trimmedContact.length > 0) {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(trimmedContact)) {
        setMessage('✗ Contact number must be exactly 10 digits')
        return
      }
    }

    // Validate email format if provided
    if (trimmedEmail && trimmedEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        setMessage('✗ Please enter a valid email address')
        return
      }
    }

    setLoading(true)
    try {
      const registerData = {
        name: trimmedName,
        rollNumber: parseInt(formData.rollNumber),
        course: trimmedCourse
      }

      // Add optional fields if provided
      if (trimmedEmail) registerData.email = trimmedEmail
      if (trimmedContact) registerData.contact = trimmedContact

      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Student registered successfully! Status: ${data.status}`)
        setStudentInfo(data.data)
        // Update contact info if email/contact were provided
        setContactInfo({
          email: data.data.email,
          contact: data.data.contact
        })
        setFormData({ name: '', rollNumber: '', course: '', email: '', contact: '' })
      } else {
        setMessage('✗ Registration failed: ' + data.message)
      }
    } catch (error) {
      setMessage('✗ Error registering student: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update student
  const handleUpdate = async (e) => {
    e.preventDefault()

    // Trim whitespace from all fields
    const trimmedName = formData.name.trim()
    const trimmedCourse = formData.course.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedContact = formData.contact.trim()

    const updateData = {}
    if (trimmedName) updateData.name = trimmedName
    if (formData.rollNumber) updateData.rollNumber = parseInt(formData.rollNumber)
    if (trimmedCourse) updateData.course = trimmedCourse
    if (trimmedEmail) updateData.email = trimmedEmail
    if (trimmedContact) updateData.contact = trimmedContact

    if (Object.keys(updateData).length === 0) {
      setMessage('Please fill in at least one field to update')
      return
    }

    // Validate phone number if provided
    if (trimmedContact && trimmedContact.length > 0) {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(trimmedContact)) {
        setMessage('✗ Contact number must be exactly 10 digits')
        return
      }
    }

    // Validate email format if provided
    if (trimmedEmail && trimmedEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        setMessage('✗ Please enter a valid email address')
        return
      }
    }

    // Validation: Check if new values match old values
    if (studentInfo && updateData.name && updateData.name === studentInfo.name) {
      setMessage('✗ New name must be different from the current name')
      return
    }
    if (studentInfo && updateData.rollNumber && updateData.rollNumber === studentInfo.rollNumber) {
      setMessage('✗ New roll number must be different from the current roll number')
      return
    }
    if (studentInfo && updateData.course && updateData.course === studentInfo.course) {
      setMessage('✗ New course must be different from the current course')
      return
    }
    if (contactInfo && updateData.email && updateData.email === contactInfo.email) {
      setMessage('✗ New email must be different from the current email')
      return
    }
    if (contactInfo && updateData.contact && updateData.contact === contactInfo.contact) {
      setMessage('✗ New contact number must be different from the current contact number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Student updated successfully! Status: ${data.status}`)
        setStudentInfo(data.data)
        // Update contact info with latest data
        setContactInfo({
          email: data.data.email,
          contact: data.data.contact
        })
        setFormData({ name: '', rollNumber: '', course: '', email: '', contact: '' })
      } else {
        setMessage('✗ Update failed: ' + data.message)
      }
    } catch (error) {
      setMessage('✗ Error updating student: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentInfo()
    fetchContactInfo()
  }, [])

  // Fetch all students only when switching to that section (not on mount)
  useEffect(() => {
    if (activeSection === 'all') {
      console.log('Fetching all students...')
      setLoading(true)
      fetch(`${API_BASE}/all`)
        .then(response => {
          console.log('Response status:', response.status)
          return response.json()
        })
        .then(data => {
          console.log('Data received:', data)
          setAllStudents(data.data || [])
          setMessage('')
        })
        .catch(error => {
          console.error('Fetch error:', error)
          setMessage('Error fetching students: ' + error.message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [activeSection])

  // Save studentInfo to localStorage whenever it changes
  useEffect(() => {
    if (studentInfo) {
      localStorage.setItem('studentData', JSON.stringify(studentInfo))
    }
  }, [studentInfo])

  // Save contactInfo to localStorage whenever it changes
  useEffect(() => {
    if (contactInfo) {
      localStorage.setItem('contactData', JSON.stringify(contactInfo))
    }
  }, [contactInfo])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="app">
      {/* Background decorative elements */}
      <div className="bg-decoration"></div>

      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="logo-icon">👨‍🎓</div>
            <div>
              <h1 className="navbar-title">Student Info Hub</h1>
              <p className="navbar-subtitle">Manage Your Academic Profile</p>
            </div>
          </div>
          <ul className="nav-links">
            <li><button className={`nav-btn ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setActiveSection('home')}>🏠 Home</button></li>
            <li><button className={`nav-btn ${activeSection === 'register' ? 'active' : ''}`} onClick={() => setActiveSection('register')}>📝 Register</button></li>
            <li><button className={`nav-btn ${activeSection === 'update' ? 'active' : ''}`} onClick={() => setActiveSection('update')}>✏️ Update</button></li>
            <li><button className={`nav-btn ${activeSection === 'all' ? 'active' : ''}`} onClick={() => setActiveSection('all')}>👥 All Students</button></li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {/* Home Section */}
        {activeSection === 'home' && (
          <section className="section fade-in">
            <div className="section-container">
              {/* Welcome Banner */}
              <div className="welcome-banner">
                <div className="welcome-content">
                  <h2>👋 Welcome to Student Information Hub</h2>
                  <p>Manage your academic profile with ease. View, register, and update your student information in one place.</p>
                  <p className="api-status">✅ API running on localhost</p>
                </div>
              </div>

              <div className="section-header" style={{marginTop: '3rem'}}>
                <h2>📊 Dashboard</h2>
                <p className="welcome-text">Welcome back! Here's your current information.</p>
              </div>

              {message && <div className={`message ${message.includes('✗') ? 'error' : 'success'}`}>
                <span className="message-icon">{message.includes('✗') ? '❌' : '✅'}</span>
                {message}
              </div>}

              {loading && <div className="spinner"><span></span><span></span><span></span></div>}

              <div className="cards-grid">
                {studentInfo && (
                  <div className="card student-card">
                    <div className="card-header">
                      <div className="card-icon">📚</div>
                      <h3>Student Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <span className="info-label">Full Name</span>
                        <span className="info-value">{studentInfo.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Roll Number</span>
                        <span className="info-value badge">{studentInfo.rollNumber}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Course</span>
                        <span className="info-value">{studentInfo.course}</span>
                      </div>
                    </div>
                    <button className="btn-refresh" onClick={fetchStudentInfo}>🔄 Refresh</button>
                  </div>
                )}

                {contactInfo && (
                  <div className="card contact-card">
                    <div className="card-header">
                      <div className="card-icon">📞</div>
                      <h3>Contact Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <span className="info-label">📧 Email</span>
                        <a href={`mailto:${contactInfo.email}`} className="info-value link">{contactInfo.email}</a>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📱 Phone</span>
                        <span className="info-value">{contactInfo.contact}</span>
                      </div>
                    </div>
                    <button className="btn-refresh" onClick={fetchContactInfo}>🔄 Refresh</button>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button className="btn btn-danger btn-lg" onClick={() => setShowDeleteConfirm(true)}>
                  🗑️ Delete Student
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                  <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                    <h3>⚠️ Confirm Delete</h3>
                    <p>Are you sure you want to delete this student record? This action will reset the data to default values.</p>
                    <div className="modal-buttons">
                      <button className="btn btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                      <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                        {loading ? '⏳ Deleting...' : '🗑️ Yes, Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {activeSection === 'register' && (
          <section className="section fade-in">
            <div className="section-container">
              <div className="section-header">
                <h2>📝 Register New Student</h2>
                <p className="welcome-text">Create a new student profile in the system.</p>
              </div>

              {message && <div className={`message ${message.includes('✗') ? 'error' : 'success'}`}>
                <span className="message-icon">{message.includes('✗') ? '❌' : '✅'}</span>
                {message}
              </div>}

              <form className="form premium-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="reg-name">🧑 Student Name <span className="required">*</span></label>
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="reg-roll">🎓 Roll Number <span className="required">*</span></label>
                    <input
                      id="reg-roll"
                      type="number"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="Enter roll number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-course">📚 Course <span className="required">*</span></label>
                    <input
                      id="reg-course"
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="reg-email">📧 Email</label>
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-contact">📱 Contact Number</label>
                    <input
                      id="reg-contact"
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? '⏳ Registering...' : '✓ Register Student'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Update Section */}
        {activeSection === 'update' && (
          <section className="section fade-in">
            <div className="section-container">
              <div className="section-header">
                <h2>✏️ Update Information</h2>
                <p className="welcome-text">Update your student profile details (optional fields).</p>
              </div>

              {message && <div className={`message ${message.includes('✗') ? 'error' : 'success'}`}>
                <span className="message-icon">{message.includes('✗') ? '❌' : '✅'}</span>
                {message}
              </div>}

              <form className="form premium-form" onSubmit={handleUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="upd-name">🧑 Student Name</label>
                    <input
                      id="upd-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter new name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="upd-roll">🎓 Roll Number</label>
                    <input
                      id="upd-roll"
                      type="number"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="Enter new roll number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="upd-course">📚 Course</label>
                  <input
                    id="upd-course"
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="Enter new course"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="upd-email">📧 Email</label>
                    <input
                      id="upd-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter new email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="upd-contact">📱 Contact Number</label>
                    <input
                      id="upd-contact"
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Enter new contact"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? '⏳ Updating...' : '✓ Update Information'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* View All Students Section */}
        {activeSection === 'all' && (
          <section className="section fade-in">
            <div className="section-container">
              <div className="section-header">
                <h2>👥 All Students</h2>
                <p className="welcome-text">View all registered students in the system.</p>
              </div>

              {message && <div className={`message ${message.includes('✗') ? 'error' : 'success'}`}>
                <span className="message-icon">{message.includes('✗') ? '❌' : '✅'}</span>
                {message}
              </div>}

              {loading && <div className="spinner"><span></span><span></span><span></span></div>}

              {!loading && allStudents && allStudents.length > 0 ? (
                <div className="students-table">
                  <div className="table-header">
                    <div className="table-cell">Name</div>
                    <div className="table-cell">Roll Number</div>
                    <div className="table-cell">Course</div>
                    <div className="table-cell">Email</div>
                    <div className="table-cell">Contact</div>
                  </div>
                  {allStudents.map((student, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">{student.name}</div>
                      <div className="table-cell badge-cell"><span className="badge">{student.rollNumber}</span></div>
                      <div className="table-cell">{student.course}</div>
                      <div className="table-cell email-cell"><a href={`mailto:${student.email}`} className="link">{student.email}</a></div>
                      <div className="table-cell">{student.contact}</div>
                    </div>
                  ))}
                </div>
              ) : (
                !loading && <div className="no-data">
                  <p>📭 No students found in the system</p>
                </div>
              )}

              <button className="btn btn-primary btn-lg" style={{marginTop: '2rem'}} onClick={async () => {
                setLoading(true)
                try {
                  const response = await fetch(`${API_BASE}/all`)
                  const data = await response.json()
                  setAllStudents(data.data || [])
                  setMessage('✓ Students list refreshed')
                } catch (error) {
                  setMessage('Error refreshing students: ' + error.message)
                } finally {
                  setLoading(false)
                }
              }}>
                🔄 Refresh Students List
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>📍 About</h4>
            <p>Student Information Hub - Manage your academic profile with ease</p>
          </div>
          <div className="footer-section">
            <h4>🔗 Quick Links</h4>
            <ul>
              <li><a href="#home">Dashboard</a></li>
              <li><a href="#register">Register</a></li>
              <li><a href="#update">Update</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>📞 Support</h4>
            <p>API running on localhost</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Student Information Hub. All rights reserved. | Crafted with ❤️</p>
        </div>
      </footer>
    </div>
  )
}

export default App
