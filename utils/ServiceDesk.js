const axios = require('axios');

class ServiceDesk
{
    static async Login(username, password){
        
        const resp = {
            status: 0,
            data: null,
            msg: ''
        };

        let xml = '';
        xml += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">`;
        xml += `   <soapenv:Header/>`;
        xml += `   <soapenv:Body>`;
        xml += `      <ser:login>`;
        xml += `         <username>${username}</username>`;
        xml += `         <password>${password}</password>`;
        xml += `      </ser:login>`;
        xml += `   </soapenv:Body>`;
        xml += `</soapenv:Envelope>`;

        try{
            const post = await axios.post(HOST_SDM, xml, {
                headers:{ 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/login' }
            });

            const sid = (/<loginReturn xmlns="">(.*?)<\/loginReturn>/g).exec(post.data)[1];
            
            if(Number(sid)){
               resp.data = sid;
               resp.msg = "Login feito com sucesso";
               resp.status = 1;
            };
        }catch(e){
            resp.msg = "Error ao fazer login";
        }

        return resp
    }
}

module.exports = ServiceDesk;