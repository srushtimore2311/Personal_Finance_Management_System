/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';
import './Balance.css';

const Balance = () => {
    const { username } = useContext(UserContext);
    const [accounts, setAccounts] = useState([]);
    
    const [cardDetails, setCardDetails] = useState({
        accountNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        amount: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isFormVisible, setFormVisible] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (!username) {
            setError("Username is not defined.");
            return;
        }

        const fetchAccounts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:9000/home/balance?username=${username}`);
                if (response.status === 200 && Array.isArray(response.data)) {
                    setAccounts(response.data);
                    const total = response.data.reduce((acc, account) => acc + parseFloat(account.amount), 0);
                    setTotalAmount(total.toFixed(2));
                } else {
                    setError('No accounts found.');
                }
            } catch (err) {
                console.error(err); // Log the error for debugging
                setError('Failed to fetch accounts. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccounts();
    }, [username]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        // Handle expiry date field for MM/YY format
        if (name === "expiryDate") {
            const formattedValue = value.replace(/[^0-9/]/g, ""); // Allow only digits and '/'
            if (formattedValue.length <= 5) { // Limit input length to 5 (MM/YY)
                const parts = formattedValue.split('/');
                if (parts.length === 1 && parts[0].length === 2) {
                    setCardDetails({ ...cardDetails, [name]: formattedValue + '/' });
                } else {
                    setCardDetails({ ...cardDetails, [name]: formattedValue });
                }
            }
        } else if (name === "cvv") {
            const numericValue = value.replace(/\D/g, "").slice(0, 3); // Limit CVV to 3 digits
            setCardDetails({ ...cardDetails, [name]: numericValue });
        } else if (name === "accountNumber") {
            const numericValue = value.replace(/\D/g, ""); // Remove non-digit characters
            if (numericValue.length > 16) return; // Limit to 16 digits
            const formattedValue = numericValue.replace(/(\d{4})(?=\d)/g, "$1 ");
            setCardDetails({ ...cardDetails, [name]: formattedValue });
        } else {
            setCardDetails({ ...cardDetails, [name]: value });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log('Submitting data:', cardDetails);
    
        try {
            const response = await axios.post('http://localhost:9000/home/add-account', {
                ...cardDetails,
                username: username
            });
    
            if (response.status === 200) {
                setSuccessMessage('Card added successfully!');
                setError('');
                setCardDetails({ accountNumber: '', cardHolder: '', expiryDate: '', cvv: '', amount: '' });
                setFormVisible(false);
                // Fetch updated account data
                const updatedResponse = await axios.get(`http://localhost:9000/home/balance?username=${username}`);
                setAccounts(updatedResponse.data);
            } else {
                setError('Failed to add the card. Please try again later.');
            }
        } catch (error) {
            // Log the error details
            console.error('Error details:', error.response ? error.response.data : error.message);
            setError('Failed to add the card. Please check your input and try again.');
        }
    };

    const toggleVisible = () => {
        setFormVisible(!isFormVisible);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="balance-container">
            <button id="acc-btn" onClick={toggleVisible}>Add Account</button>
            {successMessage && <p className="success">{successMessage}</p>}
            {error && <p className="error">{error}</p>}
            {isLoading && <p>Loading...</p>}
            {isFormVisible && (
                <div className="overlay">
                    <div className="overlay-content">
                        <div className="top-row">
                            <h2>Add Account</h2>
                            <button onClick={toggleVisible}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="accountNumber"
                                value={cardDetails.accountNumber}
                                onChange={handleInputChange}
                                placeholder="Card Number"
                                required
                            />
                            <input
                                type="text"
                                name="cardHolder"
                                value={cardDetails.cardHolder}
                                onChange={handleInputChange}
                                placeholder="Card Holder Name"
                                required
                            />
                            <input
                                type="text"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={handleInputChange}
                                placeholder="Expiry Date (MM/YY)"
                                required
                            />
                            <input
                                type="text"
                                name="cvv"
                                value={cardDetails.cvv}
                                onChange={handleInputChange}
                                placeholder="CVV"
                                required
                            />
                            <input
                                type="number"
                                name="amount"
                                value={cardDetails.amount}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                required
                            />
                            <button type="submit">Add Card</button>   
                        </form>
                    </div>
                </div>
            )}

            <div className="account-list">
                <h2>Your Accounts</h2>
                <div className="account-items">
                    {accounts.length > 0 ? (
                        accounts.map((account, index) => (
                            <div key={index} className="account-card">
                                <p className="card-number">**** **** **** {account.accountNumber.slice(-4)}</p>
                                <p className="card-holder">Card Holder: {account.cardHolder}</p>
                                <p className="card-expiry">Expiry: {account.expiryDate}</p>
                                <p className="card-cvv">CVV: {account.cvv}</p>
                                <p className="card-amount">Amount: ₹{account.amount}</p>
                            </div>
                        ))
                    ) : (
                        <p>No accounts available.</p>
                    )}
                </div>
                <div className="total-amount">
                    <h1>Total Amount: ₹{totalAmount}</h1>
                </div>
            </div>
        </div>
    );
};

export default Balance;
