let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
let cors = require('cors');
const PORT = 3000;

let pool = new pg.Pool({
  user: 'postgres',
  database: 'countries',
  password: '12345',
  host: 'localhost',
  port: 5432,
  max: 10
});

let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(morgan('dev'));

app.use(function(req, response, next) {
  response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.delete('/api/remove/:id', function(request, response){
  var id = request.params.id;
  // console.log(id);
  pool.connect(function(err, db, done){
    if(err){
      return response.status(400).send(err);
    } else {
      db.query('DELETE FROM country WHERE id = $1', [id], function(err, result){
        done();
        if(err){
          return response.status(400).send(err);
        } else {
          return response.status(200).send({message: 'success in deleting record'})
        }
      })
    }
  })
})

app.get('/api/countries', function(request, response){
  pool.connect(function(err, db, done){
    if(err){
      return response.status(400).send(err)
    } else {
      db.query('SELECT * FROM country', function(err, table){
        done();
        if(err){
          return response.status(400).send(err)
        } else {
          return response.status(200).send(table.rows)
        }
      })
    }
  })
})

app.post('/api/new-country', function(request, response) {
  // console.log(request.body); // checking connection from React Frontend to Backend
  var country_name = request.body.country_name;
  var continent_name = request.body.continent_name;
  var id = request.body.id;

  // array of values
  let values = [country_name, continent_name, id];

  // Testing API with Database
  pool.connect((err, db, done) => {
    if(err){
      return response.status(400).send(err);
    } else {
      db.query("INSERT INTO country (country_name, continent_name, id) VALUES ($1, $2, $3)", [...values], (err, table) => {
        done();
        if(err){
          return response.status(400).send(err);
        } else {
          console.log("DATA INSERTED");
          response.status(401).send({message: 'Data inserted!'});
        }
      })
    }
  })
});

app.listen(PORT, () => console.log('Listening on port '+PORT));
