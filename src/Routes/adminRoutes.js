const { validate } = require('express-validation');
const { authorize } = require('../Middlewares/authenticate');
const Employee = require('../Models/Employee');

// Controllers
const { addEmployee, login, deleteEmployee, logout, getVisits, getVisitDetails, searchEmployee, getDesabledEmployees } = require('../Controllers/adminControllers');

// Validations
const {employeeValidate} = require('../Validations/Admin/addEmployee');
const loginValidate = require('../Validations/login');

const router = require('express').Router()

// =============== GET Methods ========================

// Route to Render the Admin Dashboard
router.get("/home", authorize(["admin"]), async (req, res) => {
    const users = await Employee.find({ isAdmin: false, isDisable: false });
    res.render("Admin/home", {
        users: users,
        visits: []
    });
});

router.get('/login', async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log("Error rendering login page:", error);
        return res.status(500).send("Somthing went wrong. Please try again later");
    }
});

router.get('/register', authorize(["admin"]),(req, res) => {
    try {
        return res.render("Admin/register");
    } catch (error) {
        console.log("Error in rendering register page:- ",error.message);        
        return res.status(500).json({message: "Somthing went wrong. Please try again later"});
    }
})

// =============== POST Methods ========================

// Login Employee
router.post('/login', validate(loginValidate),login);

// Add New Employee
router.post("/register", authorize(["admin"]),validate(employeeValidate),addEmployee);

// Soft delete Employees
router.delete('/deleteEmployee/:id', authorize(["admin"]), deleteEmployee);

// Get all visits
router.get('/getVisits', authorize(["admin"]), getVisits);

// Get visit details
router.get('/getVisitDetails', authorize(["admin"]), getVisitDetails);

// Search employee using name or username
router.get('/searchEmployee', authorize(['admin']), searchEmployee);

// Show Disabled Employees
router.get('/disabled-employees', authorize(['admin']), getDesabledEmployees);

// Logout
router.post('/logout', logout);

module.exports = router;