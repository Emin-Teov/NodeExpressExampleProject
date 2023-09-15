const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mysql = require('mysql');
var moment = require('moment');
const path = require('path');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

conn.connect((err) => {
    if (err) throw err;

    const app = express();
    app.set("view engine", "ejs");

    app.use(express.static("public"));
    app.use(express.urlencoded({ extend: true }));
    app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist")));


    app.get('/', (req, res) => {
        conn.query("SELECT * FROM customers",  (err, customers, fields) => {
            if (err) throw err;
            res.render(__dirname + '/views/index.ejs', {
                edit: false,
                customers: customers,
            });
        });
    });

    app.get('/customer/:id?', (req, res) => {
        if(req.params.id){
            conn.query(`SELECT * FROM customers WHERE id = ${req.params.id}`,  (err, customer, fields) => {
                if (err) throw err;
                res.render(__dirname + '/views/index.ejs', {
                    edit: true,
                    id: req.params.id,
                    name: customer[0].name,
                    surname: customer[0].surname,
                });
            });
        }else{
            res.render(__dirname + '/views/index.ejs', {
                edit: true,
                id: 0,
            });
        }
    });

    app.post('/', (req, res) => {
        const date =  moment().format('YYYY-MM-DD hh:mm:ss');
        let sql;

        if(req.body.event == 'insert'){
            sql = `INSERT INTO customers (name, surname, created_at) VALUES ("${req.body.name}", "${req.body.surname}", "${date}")`;
        }else if (req.body.event == 'update'){
            sql = `UPDATE customers SET name = "${req.body.name}", surname = "${req.body.surname}", updated_at = "${date}" WHERE id = ${req.body.id}`;
        }else{
            sql = `DELETE FROM customers WHERE id = ${req.body.id}`
        }
        conn.query(sql, function (err, result) {
            if (err) throw err;
            res.redirect("/");
        });
            
    });

    app.listen(3000);

});