const axios = require('axios').default;

module.exports = (app) => {

    // [POST] => /request
    app.post('/request', async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
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

        const obrigatorios = ["offering", "summary", "fields"];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        if (Array.isArray(body.fields)) {
            const fieldError = body.fields.find(x => (x.name && ["", null].includes(x.name)) || (x.value && ["", null].includes(x.value)));

            if (fieldError) {
                resp.errors.push({
                    msg: "Os campos precisar ter 'name' e 'value'"
                });
                return res.status(400).send(resp);
            }
        } else {
            resp.errors.push({
                msg: "O campo 'fields' precisa ser um Array"
            });
            return res.status(400).send(resp);
        }

        const offering = await Offering.GetFirst(`id = '${body.offering}' AND deleted = 0`);

        if (!offering) {
            resp.errors.push({
                msg: "Oferta não encontrada"
            });
            return res.status(404).send(resp);
        }

        const payload = {
            id: Util.generateId(),
            status: "",
            user: session.data.user,
            ...body
        };

        const create = await Request.Create(payload);

        if(create.status !== 1){
            resp.errors.push({
                msg: "Erro ao criar Solicitação"
            });
            return res.status(500).send(resp);
        }


        body.fields.forEach(async field => {

            await RequestField.Create({
                id: Util.generateId(),
                request: payload.id,
                ...field
            });

        });


        resp.status = 1;
        resp.msg = "Solicitação criada com sucesso!";
        resp.data = payload;
        res.send(resp);
    });

    // [GET] => /request
    app.get('/request', async (req, res) => {
        const { headers, query } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
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

        const where = (query.where) ? `AND (${query.where})` : "";
        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const requests = await Request.Get(`user = '${session.data.user}' ${where}`, order_by, limit);

        for (const req of requests) {
            req.fields = await RequestField.Get(`request = '${req.id}'`);
        }

        resp.status = 1;
        resp.data = requests;
        res.send(resp);
    });
}