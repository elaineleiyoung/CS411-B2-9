import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';

export default function Login(){
    const CLIENT_ID = "e687e857785e45aaa016ecbbb7f49ba0"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const [token, setToken] = useState("")

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")
    
        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
    
            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }
    
        setToken(token)
    
    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
      }
      return (
        <div className="Login">
            {!token ?
                        <Button variant="contained" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
                            to Spotify</Button>
                        : <Button variant="contained" onClick={logout}>Logout</Button>}
        </div>
      );
}