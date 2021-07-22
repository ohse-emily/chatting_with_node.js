const express = require('express');
const router = express.Router();
const chatRouter = require('./chat/index.js');

router.use('/chat',chatRouter )
router.use('/', (req,res)=>{
    res.render('index.html')
})

module.exports = router;