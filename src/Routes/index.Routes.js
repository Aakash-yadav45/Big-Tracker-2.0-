const router = require('express').Router();
const adminRoutes = require('./adminRoutes');
const employeeRoutes = require('./employeeRoutes');

router.use('/admin', adminRoutes);
router.use('/employee', employeeRoutes);

module.exports = router;