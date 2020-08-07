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

        if (create.status !== 1) {
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

        resp.status = 1;
        resp.data = requests;
        res.send(resp);
    });

    // [GET] => /request/:id
    app.get('/request/:id', async (req, res) => {
        const { headers, params } = req;
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

        const request = await Request.GetFirst(`user = '${session.data.user}' AND id = '${params.id}'`);

        if (!request) {
            resp.errors.push({
                msg: "Solitação não encontrada"
            });
            return res.status(404).send(resp);
        }

        request.fields = await RequestField.Get(`request = '${request.id}'`);

        resp.status = 1;
        resp.data = request;
        res.send(resp);
    });

    // [PUT] => /request/:id
    app.put('/request/:id', async (req, res) => {
        const { headers, params, body } = req;
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

        const request = await Request.GetFirst(`user = '${session.data.user}' AND id = '${params.id}'`);

        if (!request) {
            resp.errors.push({
                msg: "Solitação não encontrada"
            });
            return res.status(404).send(resp);
        }

        const payload = {};
        let edit = false
        for (const field of Request.fields) {
            if (body[field] && !['id', 'user', 'created_at', 'updated_at'].includes(field)) {
                payload[field] = body[field];
                edit = true;
            }
        }

        request.fields = await RequestField.Get(`request = '${request.id}'`);

        if (body.fields && Array.isArray(body.fields)) {
            const hasFieldError = body.fields.find(x => !['', null, undefined].includes(x.id) && !['', null, undefined].includes(x.name) );

            if (hasFieldError) {
                resp.errors.push({
                    msg: "A 'id' ou 'name' dos campos precisa ser fornecida!"
                });
                return res.status(400).send(resp);
            }

            if(body.fields.find( bfield => ['', null, undefined].includes(bfield.name))){
                edit = true;
            }
        }

        if (!edit) {
            resp.errors.push({
                msg: "Não há nada para editar"
            });
            res.status(400).send(resp);
        }

        const update = await Request.Update(payload, `id = '${params.id}'`);

        if(update.status !== 1){
            resp.errors.push({
                msg: "Erro ao atualizar a Solicitação"
            });
            return res.status(500).send(resp);
        }

        body.fields.forEach(field => RequestField.Update({ value: field.value }, `(id = '${field.id}' OR name = '${field.name}') AND request = '${params.id}'`));

        resp.status = 1;
        resp.msg = "Solicitação atualizada com sucesso!";
        resp.data = { ...request, ...update.data, fields: [ ...request.fields] };
        res.send(resp);
    });
}