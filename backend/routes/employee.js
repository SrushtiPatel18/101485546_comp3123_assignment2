const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create employee
router.post('/', upload.single('profile_pic'), async (req, res) => {
    const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;
    const profile_pic = req.file ? req.file.path : null;

    const employee = new Employee({
        first_name,
        last_name,
        email,
        position,
        salary,
        date_of_joining,
        department,
        profile_pic
    });

    try {
        const newEmployee = await employee.save();
        res.status(201).json({ message: 'Employee created successfully', employee_id: newEmployee._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Search employees
router.get('/search', async (req, res) => {
    const { department, position } = req.query;
    const query = {};
    if (department) query.department = department;
    if (position) query.position = position;

    try {
        const employees = await Employee.find(query);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update employee
router.put('/:id', upload.single('profile_pic'), async (req, res) => {
    try {
        const updates = req.body;
        if (req.file) {
            updates.profile_pic = req.file.path;
        }
        const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
