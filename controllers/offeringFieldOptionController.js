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

};