module.exports = (app) => {

    // [POST] => /OfferingField
    app.post(`/OfferingField`, async (req, res) => {
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

        const obrigatorios = ['name', 'label', 'type', 'offering'];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const offering = await Offering.GetFirst(`id = '${body.offering}'`);

        if(!offering){
            resp.errors.push({
                msg: "Oferta não encontrada!"
            });
            return res.status(404).send(resp);
        }

        const fieldNameExists = await OfferingField.GetFirst(`name = '${body.name}' AND offering = '${offering.id}'`);

        if(fieldNameExists){
            resp.errors.push({
                msg: "Já existe um campo com este nome nesta oferta!"
            });
            return res.status(400).send(resp);
        }

        const payload = {
            id: Util.generateId(),
            ...body
        };

        if (body.options && Array.isArray(body.options)) {
            const optionErrors = body.options.filter(x => [ "", null ].includes(x.label) || ["", null].includes(x.value)).length > 0;

            if(optionErrors){
                resp.errors.push({
                    msg: "As opções precisam ter 'label' e 'value'"
                });
                return res.status(400).send(resp);
            }
            
            payload.options = [];

            body.options.forEach(option => {
                const obj = {
                    id: Util.generateId(),
                    field: payload.id,
                    label: option.label,
                    value: option.value
                };

                payload.options.push(obj);

                OfferingFieldOption.Create(obj);
            });

        }

        const create = await OfferingField.Create(payload);

        if(create.status !== 1){
            resp.errors.push({
                msg: "Erro ao criar campo!"
            });
            return res.status(500).send(resp);
        }


        resp.status = 1;
        resp.msg = "Campo criado com sucesso!";
        resp.data = payload;
        res.send(resp);
    });

    // [PUT] => /OfferingField/:id
    // [DELETE] => /OfferingField/:id

};