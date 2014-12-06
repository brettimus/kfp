// export a function that takes db and returns waht we otherwise want...
// module.exports ...

// creates integer sequence corresponding to [a, b)
// (i.e., b is not inclusive)
function generateSequence(a, b) {
    var result = [];
    while(b > a) {
        result.push(a);
        a++;
    }
    return result;
}
// uses fisher-yates shuffle
function randomSequence1to24() {
    var _1to24 = generateSequence(1, 25);
    var currentIndex = _1to24.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = _1to24[currentIndex];
      _1to24[currentIndex] = _1to24[randomIndex];
      _1to24[randomIndex] = temporaryValue;
    }
    return _1to24;
}

module.exports.User = function(db) {
    result = {};
    function create_user(local_auth_secret, next) {
        // consent and native_speaker are validated on the client side... is that chill?
        console.log("creating user...");
        var qry_string = "INSERT INTO users "+
                            "(local_auth_secret, consent, native_speaker, video_order) "+
                            "VALUES "+
                            "('%secret', true, true, '{%video_order}')"
                                .replace("%secret", local_auth_secret)
                                .replace("%video_order", randomSequence1to24().toString());
        console.log(qry_string);
        db.query(qry_string, function(err, result) {
            if (err) {
                console.log(err);
                return next(err);
            }
            console.log("CREATE USER RESULT:", result); // this is NOT the user object
            return next(null, result);
        });
    }

    // does pg throw an error when no rows found?
    function find_user(user_id, next) {
        var qry_string = "SELECT * FROM users WHERE id = " + user_id;
        db.query(qry_string, function(err, result) {
            if (err) return next(err);
            var user = result.rows[0];
            return next(null, user);
        });
    }
    function find_user_by_secret(local_auth_secret, next) {
        console.log("finding user by secret...");
        var qry_string = "SELECT * FROM users WHERE local_auth_secret = '%secret'".replace("%secret",local_auth_secret);
        db.query(qry_string, function(err, result) {
            if (err) {
                console.log(err);
                return next(err);
            }
            var user = result.rows[0];
            console.log("user found by secret: ", user);
            // allows us to create a new user if it doesn't exist. must return a falsy value where user is expected
            if (!(user && user.id)) {
                return next(null, false);
            }
            return next(null, user);
        });
    }

    function update_user(user_id, updates, next) {
        var qry_string = "UPDATE users SET %set_statements WHERE id = " + user_id;
        var fields_to_update = Object.keys(updates);
        var numFields = fields_to_update.length;
        var temp, set_statements;

        console.log("updating user fields");
        set_statements = fields_to_update.reduce(function(prev, current, index) {
            temp = current + " = " + updates[current];
            if (index < numFields - 1) temp += ", ";
            return prev += temp;
        }, "");
        
        console.log("Set statements: ", set_statements);
        qry_string = qry_string.replace("%set_statements", set_statements);
        db.query(qry_string, function(err, result) {
            if (err) {
                console.log("Error in update_user", err);
                return next(err);
            }
            console.log(result);
            next(null, result);
        });
    }

    return {
        create: create_user,
        update: update_user,
        find: find_user,
        find_by_secret: find_user_by_secret
    };
};

module.exports.Video = function(db) {
    function find_video(video_id, next) {
        var qry_string = "SELECT * FROM videos WHERE id = " + video_id;
        db.query(qry_string, function(err, result) {
            if (err) {
                console.log("Couldn't find video with id:", video_id, err);
                return next(err);
            }
            console.log("Video found by its id...");
            var video = result.rows[0];
            next(null, video);
        });
    }

    function create_video_response(user_id, video_id, response, next) {
        var qry_base = "INSERT INTO video_responses (user_id, video_id, response) VALUES (%uid, %vid, %response)",
            qry_string = qry_base.replace("%uid", user_id)
                                .replace("%vid", video_id)
                                .replace("%response", response);
        db.query(qry_string, function(err, result) {
            if (err) {
                return next(err);
            }
            console.log("Video response created, here's the result: ", result);
            next(null, result);
        });
    }

    return {
        find: find_video,
        create_response: create_video_response
    };
};

