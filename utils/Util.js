class Util{
    constructor(){

    }

    static Format(number, qtd){
        var formatado = number.toString();
        while(formatado.length < qtd)
            formatado = ("0" + formatado.toString());
        return formatado;
    }

    static objCount(obj){
        var count = 0;
        for(var param in obj){
            if(typeof(obj[param]) == "function")
                continue;
            
            count++;
        }
        return count;
    }

    static MD5(str){
        return require('md5')(str);
    }

    static DaysAgo(num){
        var date = new Date();
        // date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - num);
        return (date.getTime() / 1000) | 0;
    }

    static HoursAgo(num){
        var date = new Date();
        date.setHours(date.getHours() - num, date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        return (date.getTime() / 1000) | 0;
    }

    static YearsToGo(num, hour = false, minute = false, seconds = false){
        var date = new Date();
        date.setFullYear(date.getFullYear() + num);
        if(hour) date.setHours(hour);
        if(minute) date.setMinutes(minute);
        if(seconds) date.setSeconds(seconds);
        return (date.getTime() / 1000) | 0;
    }

    static MonthsToGo(num, hour = false, minute = false, seconds = false){
        var date = new Date();
        date.setMonth(date.getMonth() + num);
        if(hour) date.setHours(hour);
        if(minute) date.setMinutes(minute);
        if(seconds) date.setSeconds(seconds);
        return (date.getTime() / 1000) | 0;
    }

    static DaysToGo(num, hour = false, minute = false, seconds = false){
        var date = new Date();
        date.setDate(date.getDate() + num);
        if(hour) date.setHours(hour);
        if(minute) date.setMinutes(minute);
        if(seconds) date.setSeconds(seconds);
        return (date.getTime() / 1000) | 0;
    }

    static parseMoneyString(valor){
        var inteiro = null, decimal = null, c = null, j = null;
        var aux = new Array();
        valor = ""+valor;
        c = valor.indexOf(".",0);
        //encontrou o ponto na string
        if(c > 0){
            //separa as partes em inteiro e decimal
            inteiro = valor.substring(0,c);
            decimal = valor.substring(c+1,valor.length);
        }else{
            inteiro = valor;
        }
    
        //pega a parte inteiro de 3 em 3 partes
        for (j = inteiro.length, c = 0; j > 0; j-=3, c++){
            aux[c]=inteiro.substring(j-3,j);
        }
    
        //percorre a string acrescentando os pontos
        inteiro = "";
        for(c = aux.length-1; c >= 0; c--){
            inteiro += aux[c]+'.';
        }
        //retirando o ultimo ponto e finalizando a parte inteiro
    
        inteiro = inteiro.substring(0,inteiro.length-1);
    
        decimal = parseInt(decimal);
        if(isNaN(decimal)){
            decimal = "00";
        }else{
            decimal = ""+decimal;
            if(decimal.length === 1){
                decimal = decimal+"0";
            }else{
                decimal = decimal.substring(0, 2);
            }
        }
        valor = "R$ "+inteiro+","+decimal;
        return valor;
    }

    static parseMoneyFloat(valor){
        var inteiro = null, decimal = null, c = null, j = null;
        var aux = new Array();
        valor = ""+valor;
        c = valor.indexOf(".",0);
        //encontrou o ponto na string
        if(c > 0){
            //separa as partes em inteiro e decimal
            inteiro = valor.substring(0,c);
            decimal = valor.substring(c+1,valor.length);
        }else{
            inteiro = valor;
        }
    
        //pega a parte inteiro de 3 em 3 partes
        for (j = inteiro.length, c = 0; j > 0; j-=3, c++){
            aux[c]=inteiro.substring(j-3,j);
        }
    
        //percorre a string acrescentando os pontos
        inteiro = "";
        for(c = aux.length-1; c >= 0; c--){
            inteiro += aux[c]+'.';
        }
        //retirando o ultimo ponto e finalizando a parte inteiro
    
        inteiro = inteiro.substring(0,inteiro.length-1);
    
        decimal = parseInt(decimal);
        if(isNaN(decimal)){
            decimal = "00";
        }else{
            decimal = ""+decimal;
            if(decimal.length === 1){
                decimal = decimal+"0";
            }else{
                decimal = decimal.substring(0, 2);
            }
        }
        valor = inteiro+","+decimal;

        valor = valor.replace(/\./g, "").replace(/,/g, ".");

        return parseFloat(valor).toFixed(2);
    }

    static RemoveSpecialCharacters(newStringComAcento) {
        var string = newStringComAcento;
        if(string == "" || string == null)
            return string;
        var mapaAcentosHex = {
            a: /[\xE0-\xE6]/g,
            A: /[\xC0-\xC6]/g,
            e: /[\xE8-\xEB]/g,
            E: /[\xC8-\xCB]/g,
            i: /[\xEC-\xEF]/g,
            I: /[\xCC-\xCF]/g,
            o: /[\xF2-\xF6]/g,
            O: /[\xD2-\xD6]/g,
            u: /[\xF9-\xFC]/g,
            U: /[\xD9-\xDC]/g,
            c: /\xE7/g,
            C: /\xC7/g,
            n: /\xF1/g,
            N: /\xD1/g
        };
    
        for (var letra in mapaAcentosHex) {
            var expressaoRegular = mapaAcentosHex[letra];
            string = string.replace(expressaoRegular, letra);
        }
        return string.toLowerCase();
    }
    
    static generateId(){
        const { v1: uuid } = require('uuid');
        return uuid();
    }

    static mysql_real_escape_string (str) {
        return String(str || "").toString().replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                      // and double/single quotes
                default:
                    return char;
            }
        });
    }

    static MaskText(string, size = 3, reverse = false){
        let mask = "";
        for (let i = 0; i <= string.length - 1; i++) {
            const cond = reverse ? i >= string.length - size : !(i >= string.length - size);
            if (cond) {
                mask += string[i];
            } else {
                if (string[i] === " " || string[i] === "@" || string[i] === "." || string[i] === "-")
                    mask += string[i];
                else
                    mask += "*";
            }
        }
        return mask;
    };

    static FormatedData (data){
        if(Number(data)){
            
            if(data <= 0){
                return false;
            }
            
            const date = new Date(Number(data * 1000));
            return date.getDate() + "/" + ("00" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        }

        const date = new Date(data);
        return date.getDate() + "/" + ("00" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    };

    static fullDate (data){
        if(Number(data)){
    
            if(data <= 0){
                return false;
            }
    
            const date = new Date(Number(data * 1000));
            return ` ${date.getDate() + "/" + ("00" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear()} às ${date.getHours()}:${("00" + date.getMinutes()).slice(-2) }`;
        }
        
        const date = new Date(data);
        return ` ${date.getDate() + "/" + ("00" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear()} às ${date.getHours()}:${("00" + date.getMinutes()).slice(-2) }`;
    };

    static xmlToJson(xml){
        const xml2js = require('xml2js');
        
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, (err, result) => {
                if(err) {
                    reject(err);
                }
            
                const json = result;
                resolve(json);
            });
        });
    }

    static xPath(path, xml)
    {
        const xpath = require('xpath'), dom = require('xmldom').DOMParser;

        const doc = new dom().parseFromString(xml)
        const nodes = xpath.select(path, doc);

        return nodes.map(x => x.firstChild.data);
    }

}

module.exports = Util;