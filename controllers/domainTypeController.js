const DomainValue = require("../classes/DomainValue");
const DomainType = require("../classes/DomainType");

module.exports = (app) => {

    app.post(`/DomainType`, async (req, res) => {
        const { headers, body } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        if(!headers['authorization'] || !Number(headers['authorization'])){
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: "A Session ID precisa ser informada!"
            });
            return res.status(403).send(resp);
        }
        
        // TODO: Session verification 
        const sid = headers['authorization'];
        
        
        const obrigatorios = [ 'name', 'description' ];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if(resp.errors.length > 0){
            return res.status(400).send(resp);
        }

        const data = {
            id: Util.generateId(),
            name: body.name,
            description: body.description
        };

        const create = await DomainType.Create(data);

        if(create.status !== 1){
            resp.errors.push({
                msg: create.msg
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Tipo de Domínio criado com sucesso!";
        resp.data = data;
        res.send(resp);
    });    

    app.get('/DomainType', async (req, res) => {
        const { headers, query } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        if(!headers['authorization'] || !Number(headers['authorization'])){
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: "A Session ID precisa ser informada!"
            });
            return res.status(403).send(resp);
        }

        const sid = headers['authorization'];

        // TODO: Session verification        
        const where = (query.where) ? query.where : "";
        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const types = await DomainType.Get(where, order_by, limit);

        resp.data = types;
        resp.status = 1;
        res.send(resp);
    });

};