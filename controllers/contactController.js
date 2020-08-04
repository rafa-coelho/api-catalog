//Pegando Axios - Faz requisições em HTTP ou HTTPS
const axios = require('axios').default;

//Pegando o express
module.exports = (app) => {
    //Endpoint login
    app.post('/login', async (req, res) => {
        const salt = 'CATALOG SALT';

        // Default response
        const resp = {
            status: 0,
            msg:"",
            data: null,
            errors: []
        };

        const { body } = req;

        const obrigatorios = [ 'username', 'password' ];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if(resp.errors.length > 0){
            return res.status(400).send(resp);
        }

        const usernameExists = await User.GetFirst(`username = '${body.username}'`);
        let userid = '';

        if(!usernameExists){
            const login = await ServiceDesk.Login(body.username, body.password);
            
            if(login.status !== 1){
                resp.errors.push({
                    msg: 'Erro ao realizar login'
                });
                return res.status(401).send(resp);
            }
            
            const contact = await ServiceDesk.GetContact(login.data, body.username);
            
            if(contact.status !== 1){
                resp.errors.push({
                    msh: "Erro ao encontrar usuário no Service Desk"
                });
                return res.status(500).send(resp);
            }

            const user = {
                id: Util.generateId(),
                ...contact.data
            };

            user.password = Crypto.Encrypt(body.password, user.id);

            const contactExists = await User.GetFirst(`external_id = '${user.external_id}'`);
            if(contactExists){
                user.id = contactExists.id;
                user.password = Crypto.Encrypt(body.password, user.id);
                await User.Update(user, `id = '${contactExists.id}'`);
            }else{
                await User.Create(user);
            }

            userid = user.id;
        }else{
            userid = usernameExists.id;

            if(Crypto.Decrypt(usernameExists.password, usernameExists.id) !== body.password){
                resp.errors.push({
                    msg: "Senha incorreta!"
                });
                return res.status(401).send(resp);
            }

            const login = await ServiceDesk.Login(body.username, body.password);
            if(login.status !== 1){
                resp.errors.push({
                    msg: 'Erro ao realizar login'
                });
                return res.status(401).send(resp);
            }
        }
        
        // TODO: Verify if SDM password has changed
        
        const session = {
            id: Util.generateId(),
            user: userid
        }

        const createSession = await Session.Create(session);

        if(createSession.status !== 1){
            resp.errors.push({
                msg: "Erro ao gerar sessão"
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Login realizado com sucesso!";
        resp.data = session.id;
        res.send(resp);
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