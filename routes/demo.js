var express = require('express');
var router = express.Router();

module.exports = function(Tuple) {
    router.get('/', function(req, res) {
      res.render('demo', {});
    });

    router.get('/oops', function(req, res) {
      res.render('demo-snowden', {});
    });

    router.get('/:tid', function(req, res) {
        var tuple_id = +req.params.tid;
        var next_id = (tuple_id+1);
        Tuple.find(tuple_id, function(err, tuple_result) {
            console.log("I PASSED THE ROWS: ", tuple_result);
            if (!tuple_result) {
                res.redirect("/");
                return;
            }
            var candidates = [
                                {
                                    name: tuple_result.names[0],
                                    description: tuple_result.descriptions[0],
                                },
                                {
                                    name: tuple_result.names[1],
                                    description: tuple_result.descriptions[1],
                                },
                                {
                                    name: tuple_result.names[2],
                                    description: tuple_result.descriptions[2],
                                }
                              ];
            res.render('demo-template', { candidates: candidates, next: next_id });
        });
    });



    return router;
};

