const axios = require('axios');

// TODO: ErrorCode 1010 treatment (bad session)

class ServiceDesk {
    static async Login(username, password) {

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

        try {
            const post = await axios.post(HOST_SDM, xml, {
                headers: { 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/login' }
            });

            const sid = Util.xPath('//loginReturn', post.data)[0];
            if (Number(sid)) {
                resp.data = sid;
                resp.msg = "Login realizado com sucesso";
                resp.status = 1;
            };
        } catch (e) {
            resp.msg = "Error ao fazer login";
        }

        return resp;
    }

    static async VerificarSessao(session_id) {
        const resp = {
            status: 0
        };

        if (!Number(session_id)) {
            resp.msg = 'A session_id precisa ser um número!';
            return resp;
        }

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

        try {
            const post = await axios.post(HOST_SDM, xml, {
                headers: { 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/USD_WebServiceSoap/doSelectRequest' }
            });

            const json = await Util.xmlToJson(post.data);

            if (!json.UDSObjectList) {
                // Erro no SDM ou Sessão inválida
                return resp;
            }

            if (!json.UDSObjectList.UDSObject) {
                // Sessão não encontrada
                return resp;
            }

            resp.status = 1;
        } catch (e) {
            // TODO: Verify Session error (1010)
            const errorCode = Util.xPath('//ErrorCode', e.response.data)[0];
            resp.status = 0;
        }

        return resp;
    }

    static async GetContact(session_id, username) {
        const resp = {
            status: 0,
            data: null,
            msg: ''
        };

        let xml = '';
        xml += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">`;
        xml += `   <soapenv:Header/>`;
        xml += `   <soapenv:Body>`;
        xml += `      <ser:doSelect>`;
        xml += `         <sid>${session_id}</sid>`;
        xml += `         <objectType>cnt</objectType>`;
        xml += `         <whereClause>userid = '${username}' OR email_address = '${username}'</whereClause>`;
        xml += `         <maxRows>1</maxRows>`;
        xml += `         <attributes>`;
        xml += `            <string>first_name</string>`;
        xml += `            <string>middle_name</string>`;
        xml += `            <string>last_name</string>`;
        xml += `            <string>userid</string>`;
        xml += `            <string>email_address</string>`;
        xml += `            <string>access_type</string>`;
        xml += `         </attributes>`;
        xml += `      </ser:doSelect>`;
        xml += `   </soapenv:Body>`;
        xml += `</soapenv:Envelope>`;

        try {
            const post = await axios.post(HOST_SDM, xml, {
                headers: { 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/USD_WebServiceSoap/doSelectRequest' }
            });

            const json = await Util.xmlToJson(Util.xPath('//doSelectReturn', post.data)[0]);
            const attributes = {};
            json.UDSObjectList.UDSObject[0].Attributes[0].Attribute.map(x => { attributes[x.AttrName[0]] = x.AttrValue[0] });
            
            const user = {
                name: [attributes['first_name'], attributes['middle_name'], attributes['last_name']].filter(x => !["", null].includes(x)).join(' '),
                username: attributes['userid'],
                email: attributes['email_address'],
                external_id: json.UDSObjectList.UDSObject[0].Handle[0],
                access_type: await this.GetRoleSymById(session_id, attributes['access_type'])
            }

            resp.status = 1;
            resp.data = user;
        } catch (e) {
            // TODO: Verify Session error (1010)
            console.log(e)
            // const errorCode = Util.xPath('//ErrorCode', e.response.data)[0];
            resp.status = 0;
        }

        return resp;

    }

    static async CreateRequest(sid, customer, category, requested_by, description, summary) {
        const response = {
            status: 0,
            msg: "",
            data: ""
        };

        summary = (summary == null) ? "Solicitação padrão do Catalog" : summary;

        let xml = '';
        xml += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">';
        xml += '   <soapenv:Header/>';
        xml += '   <soapenv:Body>';
        xml += '<impl:createRequest xmlns:impl="http://www.ca.com/UnicenterServicePlus/ServiceDesk">';
        xml += '  <sid>' + sid + '</sid>';
        xml += '  <creatorHandle>' + requested_by + '</creatorHandle>';
        xml += '  <attrVals>';
        xml += '	<string>active</string>';
        xml += '	<string>1</string>';
        xml += '	<string>customer</string>';
        xml += '	<string>' + customer + '</string>';
        xml += '	<string>priority</string>';
        xml += '	<string>3</string>';
        xml += '	<string>category</string>';
        xml += '	<string>' + category + '</string>';
        xml += '	<string>type</string>';
        xml += '	<string>R</string>';
        xml += '	<string>requested_by</string>';
        xml += '	<string>' + requested_by + '</string>';
        xml += '	<string>description</string>';
        xml += '	<string>' + description + '</string>';
        xml += '	<string>summary</string>';
        xml += '	<string>' + summary + '</string>';
        xml += '  </attrVals>';
        xml += '  <propertyValues> </propertyValues>';
        xml += '  <template></template>';
        xml += '  <attributes>';
        xml += '	<string>persistent_id</string>';
        xml += '	<string>customer.userid</string>';
        xml += '	<string>status.sym</string>';
        xml += '  </attributes>';
        xml += '  <newRequestHandle></newRequestHandle>';
        xml += '  <newRequestNumber></newRequestNumber>';
        xml += '</impl:createRequest>';
        xml += '   </soapenv:Body>';
        xml += '</soapenv:Envelope>';

        try {
            const post = await axios.post(HOST_SDM, xml, { headers: { 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/createRequest' } });

            const data = post.data;
            const persid = data.slice(data.indexOf("<newRequestHandle xmlns=\"\">"), data.indexOf("</newRequestHandle>")).replace("<newRequestHandle xmlns=\"\">", "");
            const ref_num = data.slice(data.indexOf("<newRequestNumber xmlns=\"\">"), data.indexOf("</newRequestNumber>")).replace("<newRequestNumber xmlns=\"\">", "");

            response.data = { persid, ref_num };
            response.msg = "Chamado criado com sucesso";
            response.status = 1;

        } catch (e) {
            response.data = "";
            response.msg = "Error ao criar chamado";
            response.status = 0;
        } finally {
            return response
        }
    }

    static async GetRoleSymById(sid, id) {
        let xml = '';
        xml += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">`;
        xml += `   <soapenv:Header/>`;
        xml += `   <soapenv:Body>`;
        xml += `      <ser:doSelect>`;
        xml += `         <sid>${sid}</sid>`;
        xml += `         <objectType>acctyp</objectType>`;
        xml += `         <whereClause>id=${id}</whereClause>`;
        xml += `         <maxRows>-1</maxRows>`;
        xml += `         <attributes>`;
        xml += `         <string>sym</string>`;
        xml += `         </attributes>`;
        xml += `      </ser:doSelect>`;
        xml += `   </soapenv:Body>`;
        xml += `</soapenv:Envelope>`;

        try{
            const post = await axios.post(HOST_SDM, xml, {
                headers: { 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/USD_WebServiceSoap/doSelectRequest' }
            });

            const json = await Util.xmlToJson(Util.xPath('//doSelectReturn', post.data)[0]);
            const attributes = {};
            json.UDSObjectList.UDSObject[0].Attributes[0].Attribute.map(x => { attributes[x.AttrName[0]] = x.AttrValue[0] });

            return attributes.sym;

        }catch(e){
            console.log(e.response)
            return null;
        }
    }

    static async GetCategoryById(sid, id){
        let xml = '';
        xml += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">`;
        xml += `   <soapenv:Header/>`;
        xml += `   <soapenv:Body>`;
        xml += `      <ser:doSelect>`;
        xml += `         <sid>${sid}</sid>`;
        xml += `         <objectType>pcat</objectType>`;
        xml += `         <whereClause>id=${id}</whereClause>`;
        xml += `         <maxRows>1</maxRows>`;
        xml += `         <attributes>`;
        xml += `            <string>sym</string>`;
        xml += `         </attributes>`;
        xml += `      </ser:doSelect>`;
        xml += `   </soapenv:Body>`;
        xml += `</soapenv:Envelope>`;

        try{
            const post = await axios.post(HOST_SDM, xml, {
                headers: { 'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/USD_WebServiceSoap/doSelectRequest' }
            });

            const json = await Util.xmlToJson(Util.xPath('//doSelectReturn', post.data)[0]);
            const attributes = {};
            json.UDSObjectList.UDSObject[0].Attributes[0].Attribute.map(x => { attributes[x.AttrName[0]] = x.AttrValue[0] });

            return attributes.sym || null;
        }catch(e){
            console.log(e.response);
            return null;
        }
    }

}

module.exports = ServiceDesk;