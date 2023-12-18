import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => { //type: "password" || "data"
    try {
        const url = type === "data" ?
        '/api/v1/users/update-me' :
        '/api/v1/users/update-password';
        
        // console.log(url)
        const res = await axios({
            method: "patch",
            url,
            data,
        });
        if(res.data.status === 'success') {
            showAlert("success", `${type} updated successfully !!!`);
            window.setTimeout(() => {
                location.reload(true);
            }, 500);
        }
    } catch (err) {
        showAlert("error", err.response.data.message);
    }
};