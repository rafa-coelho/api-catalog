class Crypto {

    static Encrypt(text, salt) {
        var CryptoJS = require("crypto-js");
        return CryptoJS.AES.encrypt(text, salt).toString();
    }
    
    static Decrypt(text, salt) {
        var CryptoJS = require("crypto-js");
        var bytes = CryptoJS.AES.decrypt(text, salt);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

}

module.exports = Crypto;