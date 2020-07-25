const Offering = require("../classes/Offering");

module.exports = (app) => {

    // [POST] => /offering
    app.post(`/offering`, async (req, res) => {
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
        
        
        const obrigatorios = [ "name", "external_id", "fields" ];

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
            external_id: body.external_id,
            fields: body.fields.map(field => {
                const obrigatorios = [ 'name', 'label', 'type' ];

                obrigatorios.forEach(campo => {
                    if(!field[campo]){
                        resp.errors.push({
                            location: 'field',
                            msg: `Os fields precisam ter o atributo '${campo}'`
                        });
                    }

                });
                
                return field;
            })
        };

        if(resp.errors.length > 0){
            return res.status(400).send(resp);
        }

        // TODO: Verificar se a oferta já existe
        const createOffering = await Offering.Create(data);

        if(createOffering.status !== 1){
            resp.errors.push({
                msg: createOffering.msg
            });
            return res.status(500).send(resp);
        }

        data.fields.forEach(field => {
            const createField = OfferingField.Create({
                id: Util.generateId(),
                offering: data.id,
                ...field
            });           
        });

        resp.status = 1;
        resp.msg = "Oferta criada com sucesso!";
        resp.data = data;
        res.send(resp);
    });

    // [GET] =>/offering
    app.get(`/offering`, async (req, res) => {
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
        const where = (query.where) ? `(${query.where}) AND deleted = 0` : "";
        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const offerings = await Offering.Get(where, order_by, limit);
        
        resp.data = offerings;
        resp.status = 1;
        res.send(resp);
    });

};