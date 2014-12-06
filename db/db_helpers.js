// export a function that takes db and returns waht we otherwise want...
// module.exports ...

module.exports.Tuple = function(db) {
    function find_tuple(tuple_id, next) {
        var qry_string = "SELECT * FROM tuples WHERE id = " + tuple_id;
        db.query(qry_string, function(err, result) {
            if (err) {
                console.log(err);
                return next(err);
            }
            console.log("TUPLE LOOKUP RESULT: ", result); // this is NOT the user object
            // if (!result) {
            //     return next(null, {});
            // }
            return next(null, result.rows[0]);
        });
    }

    return {
        find: find_tuple,
    };
};

