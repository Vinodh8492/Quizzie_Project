import React from "react";
import axios from 'axios'
const backendUrl = 'https://final-backend-umvj.onrender.com/user'

export const loginUser = async ({ email, password }) => {
    try {
        const reqUrl = `${backendUrl}/login`;
        const response = await axios.post(reqUrl, { email, password })
        console.log(response)
        return response.data
    } catch (error) {
        console.log(error)
    }
}


export const registerUser = async ({ email, name, password, confirmpassword }) => {
    try {
        const reqUrl = `${backendUrl}/register`;
        const response = await axios.post(reqUrl, { email, name, password, confirmpassword })
        return response.data
    } catch (error) {
        console.log(error)
    }
}
