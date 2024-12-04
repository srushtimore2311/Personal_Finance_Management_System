import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';
import axios from 'axios';

const Signup = () => {
    const [res, setRes] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');
    const username = useRef();
    const password = useRef();

    const post_data = () => {
        setErrorMessage(''); 
        setRes('');

        const usernameValue = username.current.value.trim();
        const passwordValue = password.current.value.trim();

        if (!usernameValue) {
            setPasswordStrength('');
            setErrorMessage('Username cannot be empty.');
            return;
        }

        if(usernameValue.length<4)
        {
            setPasswordStrength('');
            setErrorMessage("Username must have more than 4 characters");
            return;
        }
        if (!passwordValue) {
            setPasswordStrength('');
            setErrorMessage('Password cannot be empty.');
            return;
        }
        if(passwordStrength==='Strong')
        {
            postEx(usernameValue, passwordValue);
        }else
        {
            setPasswordStrength('');
            setErrorMessage('Enter a strong password');
            return;
        }
    };

    const postEx = async (usernameValue, passwordValue) => {
        try {
            const response = await axios.post("http://localhost:9000/signup", {
                username: usernameValue,
                password: passwordValue
            });

            if (response.status === 200) {
                setPasswordStrength("");
                setRes("New User has been added Successfully!");
            } else {
                setRes("User Registration failed");
            }
        } catch (error) {
            setErrorMessage("Error during signup. Please try again.");
        }
    };

    const evaluatePasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength('');
            return;
        }

        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 
        // At least 8 characters, one uppercase, one number, one special character
        const moderatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/; 
        // At least 6 characters, one uppercase, one number

        if (strongPassword.test(password)) {
            setPasswordStrength('Strong');
        } else if (moderatePassword.test(password)) {
            setPasswordStrength('Moderate');
        } else {
            setPasswordStrength('Weak');
        }
    };

    return (
        <React.Fragment>
            <div className="signup-container">
                <div className="signup-interior">
                    <div className="login-content">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please log in with your personal info</p>
                        <Link to="/signin"><button>SIGN IN</button></Link>
                    </div>
                    <div className="register-content">
                        <h1>Create Account</h1>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        {passwordStrength && (
                            <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                                Password Strength: {passwordStrength}
                            </p>
                        )}
                        {res && <p className="result">{JSON.stringify(res)}</p>}
                        <input
                            type="text"
                            ref={username}
                            placeholder="Username"
                            autoFocus
                        />
                        <br />
                        <input
                            type="password"
                            ref={password}
                            placeholder="Password"
                            onChange={(e) => evaluatePasswordStrength(e.target.value)}
                        />
                        
                        <p>Already have an account?</p>
                        <button onClick={post_data}>SIGN UP</button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Signup;
