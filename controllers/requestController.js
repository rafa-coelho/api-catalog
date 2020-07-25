const axios = require('axios').default;

module.exports = (app) =>{
    app.post('/request', async (req,res)=>{

        const {body,headers} = req;
        const sid = headers['authorization'];
        const response = {
            data:"",
            msg:"",
            status: 0
        };

        let xml = '';
        xml += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">'
        xml += '<soapenv:Header/>' 
        xml += '<soapenv:Body>' 
        xml += '    <ser:createRequest>' 
        xml += '        <sid>'+sid+'</sid>' 
        xml += '        <creatorHandle>'+ body.requested_by +'</creatorHandle>' 
        xml += '        <attrVals>' 
        xml += '            <string>active</string>'
        xml += '	        <string>1</string>'
        xml += '	        <string>customer</string>'
        xml += '	        <string>' + body.customer + '</string>'
        xml += '	        <string>priority</string>'
        xml += '	        <string>3</string>'
        xml += '	        <string>category</string>'
        xml += '	        <string>' + body.category + '</string>'
        xml += '	        <string>type</string>'
        xml += '	        <string>R</string>'
        xml += '	        <string>requested_by</string>'
        xml += '	        <string>' + body.requested_by + '</string>'
        xml += '	        <string>description</string>'
        xml += '	        <string>' + body.description + '</string>'
        xml += '	        <string>summary</string>'
        xml += '	        <string>' + body.summary + '</string>'
        xml += '        </attrVals>'
        xml += '        <propertyValues> </propertyValues>'
        xml += '        <template></template>' 
        xml += '        <attributes>' 
        xml += '            <string>ref_num</string>'
        xml += '        </attributes>' 
        xml += '        <newRequestHandle></newRequestHandle>' 
        xml += '        <newRequestNumber></newRequestNumber>' 
        xml += '    </ser:createRequest>' 
        xml += '</soapenv:Body>'
        xml += '</soapenv:Envelope>'

        try{
            const post = await axios.post(HOST_SDM,xml,{headers:{'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/createRequest'}});

            const data = post.data;
            const persid = data.slice(data.indexOf("<newRequestHandle xmlns=\"\">"), data.indexOf("</newRequestHandle>")).replace("<newRequestHandle xmlns=\"\">", "");
            const ref_num = data.slice(data.indexOf("<newRequestNumber xmlns=\"\">"), data.indexOf("</newRequestNumber>")).replace("<newRequestNumber xmlns=\"\">", "");
            
            response.data = {persid,ref_num};
            response.msg = "Chamado criado com sucesso";
            response.status = 1;

        }catch(e){
            response.data = "";
            response.msg = "Error ao criar chamado";
            response.status = 0;
        }finally{
            res.send(response)
        }
        

    })
}