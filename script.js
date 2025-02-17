
// Function to send the data to the backend
document.getElementById('addTrans').addEventListener('submit', async (event) => {
    //Prevent the default form submit
    event.preventDefault();

    // Get Form data
    const title = document.getElementById('title').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;

    //Create the data object to send
    const transactionData = {title, amount, category, date, type};

    try{
        const response = await fetch('http://localhost:3000/add-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        });

        // handle the response
        if (response.ok){
            const result = await response.text();
            alert(result);

            await updateFinancialSummary();
        } else{
            alert('Failed to add transaction.');
        }
    } catch (error){
        console.error('Error:', error);
        alert('An error occured while adding the transaction. ');
    }
});

//Function to view the data from the backend
document.getElementById('viewTransactionsBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        // Fetch transactions from the server
        const response = await fetch('http://localhost:3000/get-transactions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Handle errors in response
        if (!response.ok) {
            throw new Error(`HTTP error! STATUS: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();
        const transactionList = document.getElementById('transactionListBody');

        // Clear existing rows
        transactionList.innerHTML = '';

        // Filter out invalid transactions
        const validTransactions = data.filter(
            (transaction) =>
                transaction.title &&
                transaction.amount &&
                transaction.category &&
                transaction.date &&
                transaction.type
        );

        // Check if there are no valid transactions
        if (validTransactions.length === 0) {
            transactionList.innerHTML = '<tr><td colspan="5">No transactions found</td></tr>';
            return;
        }

        // Populate table with valid transactions
        validTransactions.forEach((transaction) => {
            const row = `<tr>
                <td>${transaction.title}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.category}</td>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>${transaction.type}</td>
            </tr>`;
            transactionList.insertAdjacentHTML('beforeend', row);
        });
        //show the table when transactions are loaded
        document.getElementById('transactionsTable').style.display = 'table';
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching transactions. Please try again.');
    }
});


async function updateFinancialSummary() {
    try {
        // Fetch total income
        const incomeResponse = await fetch('http://localhost:3000/get-totalIncome', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!incomeResponse.ok) {
            throw new Error(`Failed to fetch the total income STATUS: ${incomeResponse.status}`);
        }

        const incomeData = await incomeResponse.json();
        if (incomeData.totalIncome === undefined) {
            throw new Error('Invalid response for total income');
        }

        // Fetch total expense
        const expenseResponse = await fetch('http://localhost:3000/get-totalExpense', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!expenseResponse.ok) {
            throw new Error(`Failed to fetch the total expense STATUS: ${expenseResponse.status}`);
        }

        const expenseData = await expenseResponse.json();
        if (expenseData.totalExpense === undefined) {
            throw new Error('Invalid response for total expense');
        }

        const chartData = document.getElementById("transChart").getContext("2d");

        // Update the DOM with the fetched values
        const totalIncome = parseFloat(incomeData.totalIncome || 0).toFixed(2);
        const totalExpense = parseFloat(expenseData.totalExpense || 0).toFixed(2);
        const netBalance = (totalIncome - totalExpense).toFixed(2);

        // Create the bar chart 
        new Chart(chartData, {
            type: "bar", 
            data: {
                labels: ["Net Balance", "Income", "Expenses"],
                datasets: [{
                    label: "Financial Overview",
                    data: [netBalance,totalIncome, totalExpense],
                    backgroundColor: ["#4CAF50", "#2196F3", "#F44336"],
                    borderColor: ["#388E3C", "#1976D2", "#D32F2F"],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        document.getElementById('incomeID').textContent = `Total Income: $${totalIncome}`;
        document.getElementById('expenseID').textContent = `Total Expense: $${totalExpense}`;
        document.getElementById('netBalance').textContent = `Net Balance: $${netBalance}`;
    } catch (error) {
        console.error('Error fetching financial summary:', error);
        alert('An error occurred while fetching financial data.');
    }
}

document.addEventListener('DOMContentLoaded', updateFinancialSummary);