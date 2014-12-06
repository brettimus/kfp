var pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/killfuck',
    client,
    query,
    tuples_qry = "INSERT INTO tuples (names, descriptions) VALUES ",
    base_val = "('{%names}', '{%descriptions}')",
    tmp_val;

var csv2json = require("csv-to-json");
var stimuli = csv2json.parse("./db/seed-data.csv");
var video_filterer = function(d) {
    return !!d.Pairing;
};

var candidate_data = stimuli.filter(video_filterer),
    numCandidates = candidate_data.length,
    numTuples = Math.floor(numCandidates / 3),
    i,
    pairingFilter = function(d) {
        return +d.Pairing === (i+1);
    };

var names,
    descriptions,
    namerator = function(d) { return d.Name; },
    descripterator = function(d) { return d["Listed Profession"]; };


// we separate out tuples
for (i = 0; i < numTuples; i += 1) {
    var members = candidate_data.filter(pairingFilter);
    if (members.length === 3) {
        names = members.map(namerator);
        descriptions = members.map(descripterator);

        tmp_val = base_val.replace("%names", names.toString())
                      .replace("%descriptions", descriptions.toString());
    }

    if (i !== numTuples-1) {
        tuples_qry += ", ";
    } else {
        tuples_qry += ";";
    }
}

console.log(tuples_qry);

client = new pg.Client(connectionString);
client.connect();
query = client.query(tuples_qry);
query.on('error', function(err) {
    console.log(err);
});
query.on('end', function() {
    client.end();
    console.log('DONE!');
});
