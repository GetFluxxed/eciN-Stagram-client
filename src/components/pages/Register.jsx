import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import Cookies from 'js-cookie'

import '../../css/Register.css'

export default function Register({ currentUser, setCurrentUser }) {
    let [username, setUsername] = useState('')
    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    let [msg, setMsg] = useState('')

    let [loginSignup, setLoginSignup] = useState(true)
    
    if(currentUser) {
        return <Navigate to='/' />
    }

    let handleSignUp = async e => {
        e.preventDefault()
        try {
            let form = {
                email,
                username,
                password
            }
            let response = await axios.post('http://localhost:8000/users/register', form)
            let { token } = response.data
            console.log(token)
            localStorage.setItem('jwt', token)

            let decoded = jwt_decode(token)
            console.log(decoded)
            setCurrentUser(decoded)
            console.log(currentUser)
        }
        catch(err) {
            setMsg('Email already exists')
            console.log(err)
        }
    }

    let handleLogIn = async(e) => {
        e.preventDefault()
        try {  
            let form = {
                email,
                password
            }
            let login = await axios.post('http://localhost:8000/users/login', form)

            let { token } = login.data
            localStorage.setItem('jwt', token)
            let decoded = jwt_decode(token)
            setCurrentUser(decoded)
            // console.log(login.data)
        } catch(err) {
            setMsg('Invalid email or password')
            console.log(err)
        }
    }

    let loginSignupToggle = () => {
        setMsg(null)
        setLoginSignup(!loginSignup)
    }

    let register = (
        <div className='register'>
            <h1 className='registerTitle'>REGISTER</h1>
            <h1>{msg ? msg : null}</h1>
            <form onSubmit={handleSignUp}>
                <label htmlFor='username'>Username:</label>
                <input 
                    type='text' 
                    name='username' 
                    id='username' 
                    placeholder='Username...'
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <br />
                <label htmlFor='email'>Email:</label>
                <input
                    type='email'
                    name='email'
                    id='email'
                    placeholder='sample@email.com'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input 
                    type='password'
                    name='password'
                    id='password'
                    placeholder='********!'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <br />
                <button type='submit'>Register</button>
            </form>
            <button type='button' onClick={loginSignupToggle}>Already have an account? Log in</button>
        </div>
    )
    let logIn = (
        <div>
            <h1 className='loginTitle'>LOG IN</h1>
            <h1>{msg ? msg : null}</h1>
            <form onSubmit={handleLogIn}>
                <label htmlFor='email'>Email:</label>
                <input
                    type='email'
                    name='email'
                    id='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input
                    type='password'
                    name='password'
                    id='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <br />
                <button type='submit'>Log in</button>
            </form>
            <button type='button' onClick={loginSignupToggle}>need signup?  Log in</button>
        </div>
    )

    return(
        <div>

            {loginSignup ? register : logIn}
        </div>
    )
}