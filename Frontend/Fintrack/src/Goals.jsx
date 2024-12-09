import React, { useContext, useState, useEffect } from 'react';
import './Goals.css';
import { UserContext } from './UserContext';
import axios from 'axios';

const Goals = () => {
  const { username } = useContext(UserContext);
  const [isFormVisible, setFormVisible] = useState(false);
  const [goals, setGoals] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [goalsDetails, setGoalsDetails] = useState({
    goalName: '',
    goalAmount: '',
  });

  const toggleOverlay = () => setFormVisible(!isFormVisible);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGoalsDetails({ ...goalsDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goalsDetails.goalName || !goalsDetails.goalAmount) {
      setError('Goal name and amount are required');
      return;
    }
    try {
      const response = await axios.post('http://localhost:9000/home/goals/add', {
        ...goalsDetails,
        username,
      });
      if (response.status === 200) {
        setSuccessMsg('Goal added successfully');
        setFormVisible(false);
        setGoalsDetails({ goalName: '', goalAmount: '' });
        await fetchGoals();
        await fetchTransactions();
      }
    } catch (error) {
      setError('Failed to add goal');
    }
  };
  
  const fetchGoals = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/home/goals?username=${username}`);
      if (response.status === 200) {
        setGoals(response.data);
      } else {
        setError('Failed to fetch goals');
      }
    } catch (error) {
      setError('Failed to fetch goals');
      console.error('Error details:', error);
    }
  };
  

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/home/transaction?username=${username}`);
      if (response.status === 200) setTransactions(response.data);
    } catch {
      setError('Failed to fetch transactions');
    }
  };

  useEffect(() => {
    if (username) {
      fetchGoals();
      fetchTransactions();
    }
  }, [username]);

  const calculateSpentAmount = (goalName) => {
    return transactions
      .filter((transaction) => transaction.goal === goalName)
      .reduce((total, transaction) => {
        if (transaction.creditOrDebit === 'debit') {
          return total - parseFloat(transaction.amount);
        }
        return total;
      }, 0);
  };

  return (
    <React.Fragment>
      {isFormVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <h1>Add New Goals</h1>
            <button onClick={toggleOverlay}>X</button>
            <form onSubmit={handleSubmit}>
              <label htmlFor="goalName">Goal Name:</label>
              <input
                type="text"
                name="goalName"
                value={goalsDetails.goalName}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="goalAmount">Goal Amount:</label>
              <input
                type="number"
                name="goalAmount"
                value={goalsDetails.goalAmount}
                onChange={handleInputChange}
                required
              />
              <button type="submit">Add Goal</button>
            </form>
          </div>
        </div>
      )}
      <div className="goals-container">
        <h1>Your Goals</h1>
        <div className="goal-interior">
        {goals.length > 0 ? (
          goals.map((goal, index) => {
            const spentAmount = calculateSpentAmount(goal.goalName);
            const remainingAmount = parseFloat(goal.goalAmount) - spentAmount;
            const spentPercentage = Math.min((spentAmount / goal.goalAmount) * 100, 100);
            const progressBarColor = spentPercentage >= 80 ? 'red' : 'rgba(0, 123, 255, 0.6)';

            return (
              <div className="goal-card" key={index}>
                <div className="goal-header">
                <div className="goal-shape">
                </div>
                  <h2>{goal.goalName}</h2>
                </div>
                <p><strong>Goal Amount:</strong> ₹{goal.goalAmount}</p>
                <p><strong>Amount Spent:</strong> ₹{spentAmount}</p>
                <p><strong>Remaining Amount:</strong> ₹{remainingAmount}</p>
                {remainingAmount < 0 && <p className="overspending">Overspending!</p>}
                {remainingAmount >= 0 && spentPercentage > 80 && (
                  <p className="spend-warning">Spend accordingly!</p>
                )}
                <div className="goal-progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${spentPercentage.toFixed(2)}%`,
                      backgroundColor: progressBarColor,
                    }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No goals added</p>
        )}
        </div>
            <button id="add-btn" onClick={toggleOverlay}>
            Add Goal
          </button> 
        {successMsg && <p className="success">{successMsg}</p>}
        {!successMsg && error && <p className="error">{error}</p>}
      </div>
    </React.Fragment>
  );
};

export default Goals;
