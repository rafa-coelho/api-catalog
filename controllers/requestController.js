const db = require('../database/connection');
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

        const session = await Session.Validar(headers['authorization'], 'post.request');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const obrigatorios = ["offering", "summary", "fields", "link" ];

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

        const user = await User.GetFirst(`id = '${session.data.user}'`);
        const offering = await Offering.GetFirst(`id = '${body.offering}' ${(user.company) ? `AND company = '${user.company}'` : ''} `);

        if (!offering) {
            resp.errors.push({
                msg: "Oferta não encontrada"
            });
            return res.status(404).send(resp);
        }

        let code = "LT-";
        if(offering.company){
            const company = await Company.GetFirst(`id = '${offering.company}'`);
            code = `${company.code}-`;
        }

        const last = (await db.raw(`SELECT * FROM ${Request.table} WHERE code like '%${code}%' ORDER BY code DESC`))[0];
        const count = last ? Number(last.code.replace(/\D+/g, '')) + 1 : 1;

        const payload = {
            id: Util.generateId(),
            code: `${code}${count}`,
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

        // Notificar Administradores
        const admins = await User.Get(`company is NULL AND id != '${session.data.user}'`);

        admins.forEach(async admin => {
            const roles = await Role.GetUserRoles(admin.id);
            if(roles.find(x => x.toLowerCase().indexOf("admin") >= 0)){
                const mail = new Mailer();
                mail.to = admin.email;
                mail.subject = "LT Catalog - Nova solicitação";
                mail.message = Mailer.NovaSolicitacao(admin, body.link + payload.id);
                mail.Send();
            }
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

        const session = await Session.Validar(headers['authorization'], 'get.request');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const user = await User.GetFirst(`id = '${session.data.user}'`);

        let requests = [];
        
        let where = (query.where) ? query.where : "";
        const order_by = (query.order_by) ? query.order_by : "created_at";
        let limit = (query.limit) ? query.limit : '';

        if(user.company){
            where = `${(where) ? `${where} AND` : ''} ${Request.table}.deleted = 0 AND ${Request.table}.user = '${user.id}' ${(user.company) ? `AND ${Offering.table}.company = '${user.company}'` : ''}`;
            
            limit = (limit) ? limit : 1000000;
            let offset = 0;
            
            if(limit){
                if(limit.toString().indexOf(',') >= 0){
                    offset = limit.split(',')[0].replace(/\D+/g, '')
                    limit = limit.split(',')[1].replace(/\D+/g, '')
                }
            }
    
            requests = await db(Request.table)
                .join(Offering.table, `${Offering.table}.id`, `${Request.table}.offering`)
                .select(Request.fields.map(x => `${Request.table}.${x}`))
                .whereRaw(where)
                .orderByRaw(order_by)
                .limit(limit)
                .offset(offset)
                // .count();

            const count = await db(Request.table)
                .join(Offering.table, `${Offering.table}.id`, `${Request.table}.offering`)
                .select(Request.fields.map(x => `${Request.table}.${x}`))
                .whereRaw(where)
                .count(`${Request.table}.id AS CNT`);
            
            res.set("X-TOTAL-COUNT", count[0].CNT);
        }else{
            requests = await Request.Get(where, order_by, limit);
            res.set("X-TOTAL-COUNT", await Request.Count(where));
        }

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            const offering = await Offering.GetFirst(`id = '${request.offering}'`);
            requests[i].offering_name = offering.name;
        }
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

        const session = await Session.Validar(headers['authorization'], 'get.request');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const user = await User.GetFirst(`id = '${session.data.user}'`);
        
        let where = `${Request.table}.id = '${params.id}'`;
        let request = await Request.GetFirst(where);
        
        if(user.company){
            where = `${(where) ? `${where} AND` : ''} ${Request.table}.deleted = 0 AND ${Request.table}.user = '${user.id}' ${(user.company) ? `AND ${Offering.table}.company = '${user.company}'` : ''}`;

            request = (await db(Request.table)
                .join(Offering.table, `${Offering.table}.id`, `${Request.table}.offering`)
                .select(Request.fields.map(x => `${Request.table}.${x}`))
                .whereRaw(where))[0];
        }

        if (!request) {
            resp.errors.push({
                msg: "Solitação não encontrada"
            });
            return res.status(404).send(resp);
        }

        request.fields = await RequestField.Get(`request = '${request.id}'`);

        const offering = await Offering.GetFirst(`id = '${request.offering}'`);
        request.offering_name = offering.name;

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

        const session = await Session.Validar(headers['authorization'], 'put.request');

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

        if(body.fields){
            body.fields.forEach(field => RequestField.Update({ value: field.value }, `(id = '${field.id}' OR name = '${field.name}') AND request = '${params.id}'`));
        }

        resp.status = 1;
        resp.msg = "Solicitação atualizada com sucesso!";
        resp.data = { ...request, ...update.data };
        res.send(resp);
    });

    // [DELETE] => /request/:id
    app.delete('/request/:id', async (req, res) => {
        const { headers, params } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'delete.request');

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

        const deleteRequest = await Request.Delete(`id = '${params.id}'`);

        if(deleteRequest.status !== 1){
            resp.errors.push({
                msg: "Erro ao excluir Solicitação"
            });
            return res.status(500).send(resp);
        }

        RequestField.Delete(`request = '${params.id}'`);

        resp.status = 1;
        resp.msg = "Solitação excluída com sucesso!";
        res.send(resp);
    });
}