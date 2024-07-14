import React from "react";
import { useState } from "react";
import { auth } from "../firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            setError(error.message);
        }
    };


    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Login / Sign Up</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onClick={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" Please Enter Your Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Please Enter Your Password"
                    required
                />
                <button type="submit" > Login </button>
                <button type="submit" onClick={handleSignUp}> Sign Up </button>
            </form>
        </div>
    );  
}

export default Login;
