import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const login = () => {
    const navigate = useNavigate();
    const [formLogin, setFormLogin] = React.useState({
        email: '',
        password: '',
    });
    const handleChange = (e) => {
        setFormLogin({
            ...formLogin,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form');
        console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
        console.log('Submitting login form:', formLogin);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, formLogin);
            console.log('Login successful:', response.data);
            if (response.status === 200) {
                alert('Login successful!');
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
    return (
        <div>
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={formLogin.email} onChange={handleChange} />
                <br />
                <label>Password:</label>
                <input type="password" name="password" value={formLogin.password} onChange={handleChange} />
                <br />
                <button type="submit" className="bg-blue-500 p-2 ">
                    Login
                </button>
            </form>
        </div>
    );
};

export default login;
