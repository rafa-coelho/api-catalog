//Pegando Axios - Faz requisições em HTTP ou HTTPS
const axios = require('axios').default;

//Pegando o express
module.exports = (app) => {
    //Endpoint login
    app.post('/login', async (req,res) => {

        //Error
        const response = {
            data: "",
            msg:"",
            status: 0
        }
        
        const {body} = req;
        let xml = '';
        xml += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">`;
        xml += `   <soapenv:Header/>`;
        xml += `   <soapenv:Body>`;
        xml += `      <ser:login>`;
        xml += `         <username>${body.username}</username>`;
        xml += `         <password>${body.password}</password>`;
        xml += `      </ser:login>`;
        xml += `   </soapenv:Body>`;
        xml += `</soapenv:Envelope>`;

        try{
            const post = await axios.post(HOST_SDM,xml,{headers:{'SOAPAction': 'http://www.ca.com/UnicenterServicePlus/ServiceDesk/login'}});

            const sid = (/<loginReturn xmlns="">(.*?)<\/loginReturn>/g).exec(post.data)[1];
            
            if(Number(sid)){
               response.data = sid;
               response.msg = "Login feito com sucesso";
               response.status = 1;
            };
        }catch(e){
            response.msg = "Error ao fazer login";
        }finally{
            
            res.send(response)
        };
      
    });  

    //Endpoint logout
    app.post('/logout', async(req,res)=>{

        const response = {
            data: "",
            msg:"",
            status: 1
        };

        const {headers} = req;
        const sid = headers['authorization'];

        let xml = '';
        xml += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.ca.com/UnicenterServicePlus/ServiceDesk">'
        xml += '    <soapenv:Header/>'
        xml += '    <soapenv:Body>'
        xml += '        <ser:logout>'
        xml += '            <sid>'+sid+'</sid>'
        xml += '        </ser:logout>'
        xml += '    </soapenv:Body>'
        xml += '</soapenv:Envelope>'

        try{
            await axios.post(HOST_SDM,xml,{headers:{'SOAPAction':'http://www.ca.com/UnicenterServicePlus/ServiceDesk/logout'}});
        }catch(e){
            console.log(e);
        }finally{
            res.send(response);
        };
        
    });
    
};