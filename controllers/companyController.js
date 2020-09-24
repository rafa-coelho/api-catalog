module.exports = (app) => {

    // [GET] => /company
    app.get(`/company`, async (req, res) => {
        const { headers, query } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'get.company');

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

        const requests = await Company.Get(where, order_by, limit);

        resp.status = 1;
        resp.data = requests;
        res.send(resp);
    });

    // [POST] => /company
    app.post(`/company`, async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'post.company');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const obrigatorios = [ "name" ];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const companyExiste = await Company.GetFirst(`name = '${body.name}'`);

        if(companyExiste){
            resp.errors.push({
                msg: "Já existe uma empresa com este nome"
            });
            return res.status(401).send(resp);
        }

        const data = {
            id: Util.generateId(),
            name: body.name
        };

        const create = await Company.Create(data);

        if(create.status !== 1){
            resp.errors.push({
                msg: "Erro ao criar Empresa"
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.data = data;
        resp.msg = "Empresa criada com sucesso!";
        res.send(resp);
    });

    // [GET] => company/:id
    app.get(`/company/:id`, async (req, res) => {
        const { headers, params } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'get.company');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const company = await Company.GetFirst(`id = '${params.id}'`);

        if (!company) {
            resp.errors.push({
                msg: "Empresa não encontrada"
            });
            return res.status(404).send(resp);
        }

        resp.status = 1;
        resp.data = company;
        res.send(resp);
    });

};