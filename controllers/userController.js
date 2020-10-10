module.exports = (app) => {

    app.post('/login', async (req, res) => {
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const { body } = req;

        const obrigatorios = ['email', 'password'];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const emailExists = await User.GetFirst(`email = '${body.email}'`);
        let userid = '';

        if (!emailExists) {
            resp.errors.push({
                msg: 'Usuário não encontrado'
            });
            return res.status(403).send(resp);
        }

        userid = emailExists.id;

        if (Crypto.Decrypt(emailExists.password, emailExists.id) !== body.password) {
            resp.errors.push({
                msg: "Senha incorreta!"
            });
            return res.status(401).send(resp);
        }

        const session = {
            id: Util.generateId(),
            user: userid
        }

        const createSession = await Session.Create(session);

        if (createSession.status !== 1) {
            resp.errors.push({
                msg: "Erro ao gerar sessão"
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Login realizado com sucesso!";
        resp.data = { id: session.id, roles: await Role.GetUserRoles(userid) };
        res.send(resp);
    });

    app.post('/logout', async (req, res) => {
        const { headers } = req;

        const response = {
            status: 0,
            msg: ""
        };

        const session = await Session.GetFirst(`id = '${headers['authorization']}'`);

        if (session) {
            const logout = await Session.Delete(`ìd = '${headers['authorization']}'`);
            if (logout.status !== 1) {
                resp.errors.push({
                    msg: "Erro ao realizar logout!"
                });
                return res.status(500).send(resp);
            }
        }

        resp.status = 1;
        resp.msg = "Logout realizado com sucesso!";
        res.send(resp);
    });


    // [POST] => /user
    app.post(`/user`, async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'post.user');
        
        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const obrigatorios = [ 'name', 'email', 'roles', 'link' ];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        
        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        if(!Array.isArray(body.roles) || body.roles < 1){
            resp.errors.push({
                msg: `O capmpo 'roles' precisa ser um array de IDs`
            });
            return res.status(400).send(resp);
        }

        
        for (let i = 0; i < body.roles.length; i++) {
            const roleId = body.roles[i];
            const role = await Role.GetFirst(`id = '${roleId}'`);
            if(!role){
                resp.errors.push({
                    msg: `Perfil com a id '${roleId}' não foi encontrado`
                });
                return res.status(404).send(resp);
            }
            
        }
        
        const userExists = await User.Get(`email = '${body.email}'`);

        if(userExists.find(x => x.email == body.email)){
            resp.errors.push({
                msg: "Esse email já está em uso"
            });
            return res.status(400).send(resp);
        }

        if(userExists.find(x => x.username == body.username)){
            resp.errors.push({
                msg: "Esse username já está em uso"
            });
            return res.status(400).send(resp);
        }

        if(body.company){
            const company = await Company.GetFirst(`id = '${body.company}'`);
            if(!company){
                resp.errors.push({
                    msg: "Empresa não encontrada"
                });
                return res.status(400).send(resp);
            }
        }

        const id = Util.generateId();
        const payload = {
            id: id,
            password: Crypto.Encrypt(Crypto.generateUID(), id),
            status: 2
        };

        User.fields.forEach(campo => {
            if(body.hasOwnProperty(campo) && ![ "id", "password", "status" ].includes(campo))
                payload[campo] = body[campo];
        });

        const create = await User.Create(payload);

        if(create.status !== 1){
            resp.errors.push({
                msg: "Erro ao criar usuário"
            });
            return res.status(500).send(resp);
        }

        body.roles.forEach(async role => {
            await Role.AddUserRole(payload.id, role);
        });

        // Create template
        const mail = new Mailer();
        mail.to = payload.email;
        mail.subject = "LT Catalog - Nova conta";
        mail.message = Mailer.NovaConta(payload, body.link + `?ui=${payload.id}`);
        await mail.Send();

        resp.status = 1;
        resp.msg = "Usuário criado com sucesso!";
        resp.data = payload;
        res.send(resp);
    });

    // [PUT] => /user/:id/password
    app.put(`/user/:id/password`, async (req, res) => {
        const { body, params } = req;
        const resp = {
            status: 0,
            msg: "",
            errors: []
        };
        
        req.assert('password', `O campo 'password' é obrigatório!`).notEmpty();

        resp.errors = req.validationErrors() || [];
       
        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const user = await User.GetFirst(`id = '${params.id}'`);

        if(!user){
            resp.errors.push({
                msg: "Usuário não encontrado!"
            });
            return res.status(400).send(resp);
        }

        // status 2 == "to validate"
        if(Number(user.status) !== 2){
            resp.errors.push({
                msg: "Esse usuário já possui uma senha"
            });
            return res.status(400).send(resp);
        }

        const update = await User.Update({ password: Crypto.Encrypt(body.password, params.id), status: 1 }, `id = '${params.id}'`);
        if(update.status !== 1){
            resp.errors.push({
                msg: "Erro ao criar senha"
            });
            return res.status(500).send(resp);
        }

        resp.status = 1;
        resp.msg = "Senha criada com sucesso!";
        res.send(resp);
    });

    // [GET] => /user/profile
    app.get(`/user/profile`, async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'get.user');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        const user = await User.GetFirst(`id = '${session.data.user}'`);

        resp.status = user ? 1 : 0;
        resp.data = user;
        res.send(resp);
    });
};