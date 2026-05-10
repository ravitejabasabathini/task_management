import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Login = ({ onLogin }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError(null);

    try {

      const response = await api.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem(
        'token',
        response.data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);

      navigate('/dashboard');

    } catch (err) {

      setError(
        err.response?.data?.message || 'Login failed'
      );
    }
  };

  return (

    <div className="auth-shell">

      <div className="auth-card">

        {/* TOP SECTION */}

        <div className="auth-hero">

          <h2>Welcome Back</h2>

          <p>
            Sign in to manage your projects and stay on track.
          </p>

        </div>

        {/* LOGIN FORM */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

          </div>

          {/* ERROR MESSAGE */}

          {error && (

            <div
              className="message-banner"
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                borderColor: 'rgba(239, 68, 68, 0.25)'
              }}
            >
              {error}
            </div>

          )}

          {/* LOGIN BUTTON */}

          <button
            className="btn btn-primary"
            type="submit"
          >
            Login
          </button>

          {/* SIGNUP LINK */}

          <p className="auth-note">

            New here?

            {' '}

            <Link to="/signup">
              Create an account
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
};

export default Login;