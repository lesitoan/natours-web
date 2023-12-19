// import "@babel/polyfill";
import { login, logout } from './login';
import { updateSettings } from "./updateMe";

const btnFormLogin = document.querySelector('.form--login');
const btnLogout = document.querySelector('.nav__el--logout');
const btnFormUserData = document.querySelector('.form-user-data');
const btnFormUserPassword = document.querySelector('.form-user-password');

if (btnFormLogin) {
    btnFormLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        login(email, password);
    });
};

if(btnLogout) {
    btnLogout.addEventListener('click', logout);
};

if(btnFormUserData) {
    btnFormUserData.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    });
};

if(btnFormUserPassword) {
    btnFormUserPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password ').innerHTML = 'Updating.......';
        const password = document.querySelector('#password-current').value;
        const newPassword = document.querySelector('#password').value;
        const newPasswordConfirm = document.querySelector('#password-confirm').value;
        await updateSettings({password, newPassword, newPasswordConfirm}, 'password');

        document.querySelector('.btn--save-password ').innerHTML = 'Save password'
        document.querySelector('#password-current').value = '';
        document.querySelector('#password').value = '';
        document.querySelector('#password-confirm').value = '';
    }); 
}