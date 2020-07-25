const DomainValue = require("../classes/DomainValue");

module.exports = (app) => {

    app.post('/DomainValue', async (req, res) => {
        const { headers, body } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        if (!headers['authorization'] || !Number(headers['authorization'])) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: "A Session ID precisa ser informada!"
            });
            return res.status(403).send(resp);
        }

        // TODO: Session verification 
        const sid = headers['authorization'];

        const obrigatorios = ['value'];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        if(!body.type && !body.parent){
            resp.errors.push({
                msg: "Informe o Tipo de Domínio ou Valor Pai"
            });
            return res.status(400).send(resp);
        }

        if (body.type) {
            const type = await DomainType.GetFirst(`id = '${body.type}'`);

            if(!type){
                resp.errors.push({
                    msg: "Tipo de domínio não encontrado"
                });
                return res.status(404).send(resp);
            }
        }

        if (body.parent) {
            const parent = await DomainValue.GetFirst(`id = '${body.parent}'`);

            if(!parent){
                resp.errors.push({
                    msg: "Valor Domínio pai não encontrado"
                });
                return res.status(404).send(resp);
            }
        }

        const data = {
            id: Util.generateId(),
            ...body
        };

        const create = await DomainValue.Create(data);

        if(create.status !== 1){
            resp.errors.push({
                msg: create.msg
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Valor de Domínio criado com sucesso!";
        resp.data = data;
        res.send(resp);
    });

};