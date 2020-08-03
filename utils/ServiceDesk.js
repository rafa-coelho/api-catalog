const axios = require('axios');
const Util = require('./Util');

// TODO: ErrorCode 1010 treatment (bad session)

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

    static async VerificarSessao(session_id){
        const resp = {
            status: 0
        };

        let xml = '';
        xml += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">`;
        xml += `   <soapenv:Header/>`;
        xml += `   <soapenv:Body>`;
        xml += `      <ser:doSelect>`;
        xml += `         <sid>${session_id}</sid>`;
        xml += `         <objectType>session_log</objectType>`;
        xml += `         <whereClause>session_id = ${session_id} AND logout_time is null</whereClause>`;
        xml += `         <maxRows>1</maxRows>`;
        xml += `         <attributes>`;
        xml += `         </attributes>`;
        xml += `      </ser:doSelect>`;
        xml += `   </soapenv:Body>`;
        xml += `</soapenv:Envelope>`;

        try{
            const post = await axios.post(HOST_SDM, xml, {
                headers:{ 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/USD_WebServiceSoap/doSelectRequest' }
            });

            const json = await Util.xmlToJson(post.data);

            if(!json.UDSObjectList){
                // Erro no SDM ou Sessão inválida
                return resp;
            }
            
            if(!json.UDSObjectList.UDSObject){
                // Sessão não encontrada
                return resp;
            }

            resp.status = 1;
        }catch(e){
            // TODO: Verify Session error (1010)
            const errorCode = Util.xPath('//ErrorCode', e.response.data)[0];
            resp.status = 1;
        }

        return resp;
    }
}

module.exports = ServiceDesk;