var pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/killfuck',
    client,
    query,
    tuples_qry = "INSERT INTO tuples (names, descriptions, urls, pairings) VALUES ",
    base_val = "('{%names}', '{%descriptions}', '{%urls}', %pairings)",
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
    links,
    namerator = function(d) { return d.Name; },
    descripterator = function(d) { return d["Listed Profession"]; },
    linkerator = function(d) { return d["Link Name"]; };


// we separate out tuples
for (i = 0; i < numTuples; i += 1) {
    var members = candidate_data.filter(pairingFilter);
    if (members.length === 3) {
        names = members.map(namerator);
        descriptions = members.map(descripterator);
        links = members.map(linkerator);

        console.log(names, descriptions);
        tmp_val = base_val
                    .replace("%names", special_toString(names))
                    .replace("%descriptions", special_toString(descriptions))
                    .replace("%urls", special_toString(links))
                    .replace("%pairings", (i+1));
        tuples_qry += tmp_val;
    }

    if (i !== numTuples-1) {
        tuples_qry += ", ";
    } else {
        tuples_qry += ";";
    }
}

function special_toString(myArray) {
    var result = "",
        i;
    for (i = 0; i < myArray.length; i++) {
        result += "\"" + myArray[i] + "\"";
        if (i !== myArray.length -1) {
            result += ",";
        }
    }
    return result;
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
