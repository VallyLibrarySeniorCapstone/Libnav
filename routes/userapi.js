 var express = require('express');
 var router = express.Router();
 var user = require('../modal/user');


 router.get('/get', function (req, res, next) {
     user.getUsers(function(results){
        res.contentType('json');
        res.json(JSON.stringify(results));
    });
 });

 router.get('/delete/:id', function (req, res, next) {
    console.log(req.params.id);
    user.deleteUser(req.params.id, function(results){
        res.contentType('json');
        res.json(JSON.stringify(results));
    });
});

 module.exports = router;