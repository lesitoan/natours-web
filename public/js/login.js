import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'post',
            url: 'http://localhost:8080/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            showAlert("success", 'Login successfully !!!');
            window.setTimeout(() => {
                location.assign('/');
            }, 500);
        }
    } catch (err) {
        showAlert("error", err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'get',
            url: 'http://localhost:8080/api/v1/users/logout'
        });
        if(res.data.status === 'success') {
            location.reload(true); // reload server (không phải reload brower)
        }
    } catch (err) {
        console.log(err)
        showAlert('error', "Logout error, please try again !!!");
    }
}
