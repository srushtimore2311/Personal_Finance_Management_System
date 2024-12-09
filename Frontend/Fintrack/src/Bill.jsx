import React, { useContext, useState, useEffect, useMemo } from 'react';
import { UserContext } from './UserContext';
import axios from 'axios';

const Bill = ({ onNotificationAdded, onClearNotifications }) => {
  const { username } = useContext(UserContext);
  const [isFormVisible, setFormVisible] = useState(false);
  const [bills, setBills] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [billDetails, setBillDetails] = useState({
    billName: '',
    billDescription: '',
    billNotify: '',
    billDate: '',
    billAmount: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const [notificationTimeout, setNotificationTimeout] = useState(null);

  const toggleOverlay = () => {
    setFormVisible(!isFormVisible);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBillDetails({ ...billDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const notifyDate = new Date(billDetails.billNotify);
      const formattedNotifyTime = notifyDate.toISOString().slice(0, 19); // "yyyy-MM-dd'T'HH:mm:ss"
  
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
  
      const response = await axios.post('http://localhost:9000/home/bill/add', {
        ...billDetails,
        username: username,
        billNotify: formattedNotifyTime,
      });
  
      if (response.status === 200) {
        setSuccessMsg('Bill Added Successfully');
        setFormVisible(false);
        setBillDetails({
          billName: '',
          billDescription: '',
          billNotify: '',
          billDate: '',
          billAmount: '',
        });
  
        const billResponse = await axios.get(
          `http://localhost:9000/home/bill?username=${username}`
        );
        if (billResponse.status === 200) {
          // Filter bills to show only up to the current date (no future bills)
          const today = new Date();
          const filteredBills = billResponse.data.filter(bill => new Date(bill.billDate) <= today);
          const sortedBills = filteredBills.sort((a, b) => new Date(b.billNotify) - new Date(a.billNotify));
          setBills(sortedBills);
        }
  
        const currentTime = new Date().toISOString().slice(0, 19);
        const timeDifference = new Date(formattedNotifyTime) - new Date(currentTime);
  
        if (timeDifference <= 0) {
          setError('Notification time is in the past. Cannot set notification.');
          return;
        }
  
        const notification = {
          notifyName: `Bill: ${billDetails.billName} is due!`,
          notifyTime: formattedNotifyTime,
          username: username,
        };
  
        // Trigger notification at the set time
        const newTimeout = setTimeout(async () => {
          try {
            const notificationResponse = await axios.post(
              'http://localhost:9000/home/addNotify',
              notification
            );
            if (notificationResponse.status === 200) {
              onNotificationAdded('red');
              // Show the bill when the time matches
              alert(`Your bill "${billDetails.billName}" is due now!`);
            }
          } catch (error) {
            console.log(error);
          }
        }, timeDifference);
  
        setNotificationTimeout(newTimeout);
      }
    } catch (error) {
      console.error('Error occurred while adding bill:', error);
      setError('Failed to add Bill');
    }
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/home/bill?username=${username}`);
        if (response.status === 200) {
          // Filter bills to show only up to today's date (no future bills)
          const today = new Date();
          const filteredBills = response.data.filter(bill => new Date(bill.billDate) <= today);
          const sortedBills = filteredBills.sort((a, b) => new Date(b.billNotify) - new Date(a.billNotify));
          setBills(sortedBills);
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError('Failed to fetch bills.');
      }
    };
    fetchBills();
  }, [username]);

  const currentEntries = useMemo(() => {
    return bills.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [bills, currentPage]);

  const totalPages = useMemo(() => Math.ceil(bills.length / entriesPerPage), [bills]);

  return (
    <React.Fragment>
      <div className="bill-container">
        <h1>Upcoming Bills</h1>
        {isFormVisible && (
          <div className="overlay">
            <div className="overlay-content">
              <div>
                <h1>Add Bills</h1>
                <button onClick={() => { toggleOverlay(); setBillDetails({ billName: '', billDescription: '', billNotify: '', billDate: '', billAmount: '' }); }}>X</button>
              </div>
              <form onSubmit={handleSubmit}>
                <label htmlFor="billName">Enter bill name:</label>
                <input
                  type="text"
                  value={billDetails.billName}
                  name="billName"
                  onChange={handleInputChange}
                  placeholder="Bill Name"
                  required
                />
                <label htmlFor="billDescription">Enter bill description:</label>
                <input
                  type="text"
                  name="billDescription"
                  value={billDetails.billDescription}
                  onChange={handleInputChange}
                  placeholder="Bill Description"
                  required
                />
                <label htmlFor="billNotify">Enter date and time for Notification:</label>
                <input
                  type="datetime-local"
                  name="billNotify"
                  value={billDetails.billNotify}
                  onChange={handleInputChange}
                  placeholder="Notification Time"
                  required
                />
                <label htmlFor="billDate">Enter bill date:</label>
                <input
                  type="datetime-local"
                  name="billDate"
                  value={billDetails.billDate}
                  onChange={handleInputChange}
                  placeholder="Bill Date"
                  required
                />
                <label htmlFor="billAmount">Enter bill amount:</label>
                <input
                  type="number"
                  name="billAmount"
                  value={billDetails.billAmount}
                  onChange={handleInputChange}
                  placeholder="Bill Amount"
                  required
                />
                <button type="submit">Add Bill</button>
              </form>
            </div>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <td>Bill Name</td>
              <td>Bill Description</td>
              <td>Due Date </td>
              <td>Amount</td>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((bill, index) => (
                <tr key={index}>
                  <td>{bill.billName}</td>
                  <td>{bill.billDescription}</td>
                  <td>{new Date(bill.billDate).toLocaleDateString()}</td> {/* Format only date */}
                  <td>{bill.billAmount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="result">No bills added</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="bottom">
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || bills.length === 0}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || bills.length === 0}>
              Next
            </button>
          </div>
          <button onClick={toggleOverlay}>
            Add Bill
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {successMsg && <p className="success">{successMsg}</p>}
      </div>
    </React.Fragment>
  );
};

export default Bill;
