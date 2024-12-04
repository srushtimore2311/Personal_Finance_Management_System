import React, { useContext, useState } from "react";
import logo from "./image/logo.webp";
import notify from "./image/bell.png";
import "./Header.css";
import { UserContext } from "./UserContext";
import axios from "axios";
import signout from './image/exit.png';
import { useNavigate, useLocation, Link } from "react-router-dom";
import menubar from './image/menubar.png';
import dashboard from "./image/business-analysis.png";
import balance from "./image/wallet.png";
import transaction from "./image/transaction.png";
import bills from "./image/bill.png";
import expense from "./image/menu.png";
import goals from "./image/target.png";

const Header = ({ buttonColor, onClearNotifications }) => {
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { path: "/home/dashboard", icon: dashboard, label: "Dashboard" },
    { path: "/home/balance", icon: balance, label: "Balance" },
    { path: "/home/transaction", icon: transaction, label: "Transaction" },
    { path: "/home/bills", icon: bills, label: "Bills" },
    { path: "/home/expenses", icon: expense, label: "Expenses" },
    { path: "/home/goals", icon: goals, label: "Goals" },
  ];

  const Signout = () => {
    setUsername(null);
    navigate('/');
  };

  const showMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const toggleOverlay = async () => {
    if (!isOverlayVisible) {
      try {
        const response = await axios.get(
          `http://localhost:9000/home/getNotify?username=${username}`
        );
        if (response.status === 200) {
          setNotifications(response.data);
        } else if (response.status === 204) {
          setNotifications([]);
        } else {
          console.error("Failed to fetch notifications: Status code", response.status);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
    setOverlayVisible(!isOverlayVisible);
  };

  const deleteMapping = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:9000/home/clear?username=${username}`
      );
      if (response.status === 200) {
        setNotifications([]);
        onClearNotifications();
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const timeAgo = (time) => {
    const offset = 5.5 * 60 * 60 * 1000; 
    const now = new Date();
    const then = new Date(new Date(time).getTime() + offset);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}hr ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <React.Fragment>
      <div className="header-container">
        {/* Menu for smaller resolution devices */}
        <div className="menuimg">
          <button><img src={menubar} alt="Menu Bar" onClick={showMenu} /></button>
          {isMenuVisible && (
            <div className="menu-top-overlay">
              <div className="menu-overlay">
                <nav>
                  <ul>
                    {menuItems.map((item) => (
                      <Link to={item.path} key={item.path} className="link" onClick={showMenu}>
                        <li className={location.pathname === item.path ? "active" : ""}>
                          <img src={item.icon} alt="icon" />
                          <h4>{item.label}</h4>
                        </li>
                      </Link>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Company Logo */}
        <div className="companyname">
          <img src={logo} alt="Company logo" />
          
        </div>

        {/* Tools for small screen devices */}
        <div className="tools-for-small-size">
          <button style={{ backgroundColor: buttonColor }} onClick={toggleOverlay}>
            <img
              src={notify}
              alt="notification bar"
              className={notifications.length > 0 ? "has-notification" : ""}
            />
          </button>
          <button className="signout-btn" onClick={Signout}><img src={signout} alt="Sign out" /></button>
        </div>

        {/* Header Content */}
        <div className="menu-field">
          <div className="inside-container">
            <div className="text">
              <h2>Hi, {username}</h2>
              <h5>{new Date().toDateString()}</h5>
            </div>
            <div className="tools">
              <button style={{ backgroundColor: buttonColor }} onClick={toggleOverlay}>
                <img
                  src={notify}
                  alt="notification bar"
                  className={notifications.length > 0 ? "has-notification" : ""}
                />
              </button>
              <button className="signout-btn" onClick={Signout}><img src={signout} alt="Sign out" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for Notifications */}
      {isOverlayVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Notifications</h3>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index}>
                  <h4>{notification.notifyName}</h4>
                  <p>{timeAgo(notification.notifyTime)}</p>
                </div>
              ))
            ) : (
              <p>No notifications available</p>
            )}
            <button onClick={deleteMapping}>Clear All</button>
            <button onClick={toggleOverlay}>Close</button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Header;
