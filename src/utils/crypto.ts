import CryptoJS from 'crypto-js';

export function encrypt(data:string, key:string) {
    return CryptoJS.AES.encrypt(data, key).toString();
}

export function decrypt(encryptedData:string, key:string) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}
