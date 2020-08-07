module.exports = (app) => {

    app.post('/DomainValue', async (req, res) => {
        const { headers, body } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        // TODO: Create permission verification
        const session = await Session.Validar(headers['authorization']);

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

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

    app.get('/DomainValue', async (req, res) => {
        const { headers, query } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        const session = await Session.Validar(headers['authorization']);

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const where = (query.where) ? query.where : "";
        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const values = await DomainValue.Get(where, order_by, limit);

        resp.data = values;
        resp.status = 1;
        res.send(resp);
    });

    app.get('/DomainValue/Type/:type', async (req, res) => {
        const { headers, params, query } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        const session = await Session.Validar(headers['authorization']);

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const type = await DomainType.GetFirst(`id = '${params.type}'`);

        if(!type){
            resp.errors.push({
                msg: "Tipo de domínio não encontrado!"
            });
            return res.status(404).send(resp);
        }

        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const values = await DomainValue.Get(`type = '${params.type}'`, order_by, limit);

        resp.data = values;
        resp.status = 1;
        res.send(resp);
    });

    app.get('/DomainValue/Parent/:parent', async (req, res) => {
        const { headers, params, query } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        const session = await Session.Validar(headers['authorization']);

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const parent = await DomainValue.GetFirst(`id = '${params.parent}'`);

        if(!parent){
            resp.errors.push({
                msg: "Valor pai não encontrado!"
            });
            return res.status(404).send(resp);
        }

        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const values = await DomainValue.Get(`parent = '${params.parent}'`, order_by, limit);

        resp.data = values;
        resp.status = 1;
        res.send(resp);
    });

    app.get('/DomainValue/:id', async (req, res) => {
        const { headers, params, query } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        const session = await Session.Validar(headers['authorization']);

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const value = await DomainValue.GetFirst(`id = '${params.id}'`);

        if(!value){
            resp.errors.push({
                msg: "Valor não encontrado!"
            });
            return res.status(404).send(resp);
        }

        resp.status = 1;
        resp.data = value;
        res.send(resp);
    });

    app.put('/DomainValue/:id', async (req, res) => {
        const { headers, params, body } = req;
        const resp = {
            data: null,
            msg: "",
            status: 0,
            errors: []
        };

        // TODO: Create permission verification
        const session = await Session.Validar(headers['authorization']);

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const value = await DomainValue.GetFirst(`id = '${params.id}'`);

        if(!value){
            resp.errors.push({
                msg: "Valor não encontrado!"
            });
            return res.status(404).send(resp);
        }

        const data = {};
        let edit = false;
        const proibidos = [ "id" ];
        DomainValue.fields.forEach(campo => {
            if(body[campo] !== undefined && !proibidos.includes(campo)){
                data[campo] = body[campo];
                value[campo] = body[campo];
                edit = true;
            }
        });

        if(!edit){
            resp.errors.push({
                msg: "Nada para editar"
            });
            return res.status(400).send(resp);
        }

        const update = await DomainValue.Update(data, `id = '${params.id}'`);
        if(update.status !== 1){
            resp.errors.push({
                msg: "Erro ao atualizar!"
            });
            return res.status(500).send(resp);
        }

        resp.data = value;
        resp.status = 1;
        resp.msg = "Valor atualizado com sucesso!";
        res.send(resp);
    });

};