var pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/killfuck',
    client,
    create_users_query,
    create_tuples_query,
    create_responses_query;

client = new pg.Client(connectionString);
client.connect();
create_users_query = client.query('CREATE TABLE users (id serial PRIMARY KEY, created_at timestamp DEFAULT localtimestamp NOT NULL, contributor boolean)');
create_users_query.on('end', function() {
    // make tuple table
    create_tuples_query = client.query('CREATE TABLE tuples (id serial PRIMARY KEY, names text[], descriptions text[], pairings integer, creator_id integer references users(id));');
    create_tuples_query.on('end', function() {
        // make repsonses table
        create_responses_query = client.query('CREATE TABLE responses (id serial PRIMARY KEY, created_at timestamp DEFAULT localtimestamp NOT NULL, user_id integer references users(id), tuple_id integer references tuples(id), response text[])');
        create_responses_query.on('end', function() {
            client.end();
        });
    });
});

console.log('DONE!');