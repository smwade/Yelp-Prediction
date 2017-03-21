import axios from 'axios';

export function getMenuItems(query = '') {
    return axios.get(`/api/v1/rooms/?qr=10&q=${query}`)
        .then(response => response.data)
        .catch(response => response);
}
