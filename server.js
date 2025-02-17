//Import required modules
const express = require('express');
const mysql = require('mysql2');
const port = 3000;

// Initialize Express app
const app = express();
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Create a connection to MySQL database
const db = mysql.createConnection({
    host: 'XXXXXXXXXXXX',
    user: 'root',
    password: 'XXXXXXXXXXXXX',
    database: 'transactionDB',
});

//Connect to MYsql

db.connect((err) =>{
    if(err){
        console.error('Error connecting to MySql: ', err.message);
    }else{
        console.log('Connected to MySQL!');
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Expense Tracker API!');
});

app.get('/get-transactions', (req, res) => {
    // Query the database to select all rows from the transactions table
    db.query('SELECT * FROM transactions', (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err.message);
            res.status(500).send('Error fetching transactions');
        } else {
            // Send the results back as a JSON response
            res.json(results);
        }
    });
});

app.get('/get-totalIncome', (req, res) => {
    db.query('SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = "Income"', (err, results) => {
        if (err) {
            console.error('Error fetching total income:', err.message);
            return res.status(500).send('Error fetching total income');
        }
        const totalIncome = results[0]?.totalIncome || 0; // Handle null case
        res.json({ totalIncome });
    });
});


app.get('/get-totalExpense', (req, res) => {
    db.query('SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = "Expense"', (err, results) => {
        if (err) {
            console.error('Error fetching total expense:', err.message);
            return res.status(500).send('Error fetching total expense');
        }
        const totalExpense = results[0]?.totalExpense || 0;
        res.json({ totalExpense });
    });
});



app.post('/add-transaction', (req, res) => {
    console.log('Request Body: ', req.body);
    
    const {title, amount, category, date, type} = req.body;

    const sql = 'INSERT INTO transactions (title, amount, category, date, type) VALUES (?, ? , ? , ? , ?) ';

    db.query(sql, [title, amount, category, date, type], (err, result) => {
        if(err){
            console.error('Error inserting data: ', err);
            res.status(500).send('Database error');
            return;
        }
        res.send('Transaction added successfully!');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
