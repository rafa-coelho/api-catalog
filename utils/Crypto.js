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

    static generateUID() {
        // I generate the UID from two parts here 
        // to ensure the random number provide enough bits.
        var firstPart = (Math.random() * 46656) | 0;
        var secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        return firstPart + secondPart;
    }

}

module.exports = Crypto;