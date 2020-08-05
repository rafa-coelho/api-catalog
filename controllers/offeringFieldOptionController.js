module.exports = (app) => {

    // [POST] => /OfferingFieldOption
    app.post('/OfferingFieldOption', async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
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

        const obrigatorios = [ 'field', 'label', 'value' ];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const field = await OfferingField.GetFirst(`id = '${body.field}'`);

        if(!field){
            resp.errors.push({
                msg: "Campo não encontrado!"
            });
            return res.status(404).send(resp);
        }

        const payload = {
            id: Util.generateId(),
            ...body
        };

        const optionExists = await OfferingFieldOption.Count(`(label = '${body.label}' OR value = '${body.label}') AND deleted = 0`) > 0;

        if(optionExists){
            resp.errors.push({
                msg: "Essa opção já existe!"
            });
            return res.status(400).send(resp);
        }

        const create = await OfferingFieldOption.Create(payload);

        if(create.status !== 1){
            resp.errors.push({
                msg: "Erro ao criar opção"
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Opção criada com sucesso!";
        resp.data = payload;
        res.send(resp);
    });

    // [PUT] => /OfferingFieldOption/:id
    app.put('/OfferingFieldOption/:id', async (req, res) => {
        const { headers, body, params } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
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

        const field = await OfferingFieldOption.GetFirst(`id = '${params.id}' AND deleted = 0`);

        if(!field){
            resp.errors.push({
                msg: "Opção não encontrada"
            });
            return res.status(404).send(resp);
        }

        const payload = {};
        let edit = false;
        OfferingFieldOption.fields.forEach(_field => {
            if(body[_field] && ![ 'id', 'field' ].includes(_field)){
                payload[_field] = body[_field];
                edit = true;
            }
        });

        if(!edit){
            resp.errors.push({
                msg: "Nada para ser editado"
            });
            return res.send(resp);
        }

        const update = await OfferingFieldOption.Update(payload, `id = '${params.id}'`);

        if(update.status !== 1){
            resp.errors.push({
                msg: "Erro ao atualizar opção!"
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Opção atualizada com sucesso!";
        resp.data = { ...field, ...payload };
        res.send(resp);

    });

};