const { validate } = require('express-validation');
const { authorize } = require('../Middlewares/authenticate');
const Employee = require('../Models/Employee');

// Controllers
const { addEmployee, login, deleteEmployee, logout, getVisits, getVisitDetails, searchEmployee, getDesabledEmployees, enableEmployee, showMap } = require('../Controllers/adminControllers');

// Validations
const {employeeValidate} = require('../Validations/Admin/addEmployee');
const loginValidate = require('../Validations/login');

const router = require('express').Router()

// Route to Render the Admin Dashboard
router.get("/home", authorize(["admin"]), async (req, res) => {
    const users = await Employee.find({ isAdmin: false, isDisable: false });
    res.render("Admin/home", {
        users: users,
        visits: []
    });
});

// Route to Render the Login page
router.get('/login', async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log("Error rendering login page:", error);
        return res.status(500).send("Somthing went wrong. Please try again later");
    }
});

// Route to Render the Register Page
router.get('/register', authorize(["admin"]),(req, res) => {
    try {
        return res.render("Admin/register");
    } catch (error) {
        console.log("Error in rendering register page:- ",error.message);        
        return res.status(500).json({message: "Somthing went wrong. Please try again later"});
    }
})


// Login Employee
router.post('/login', validate(loginValidate),login);

// Add New Employee
router.post('/register', authorize(["admin"]),validate(employeeValidate),addEmployee);

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

// Enable Employee
router.post('/enableEmployee/:id', authorize(['admin']),enableEmployee);

// Show employee location on map
router.get('/map',authorize(['admin']),showMap);

// Logout
router.post('/logout', logout);

module.exports = router;