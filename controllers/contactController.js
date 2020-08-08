module.exports = (app) => {

    app.post('/login', async (req, res) => {
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const { body } = req;

        const obrigatorios = ['username', 'password'];

        obrigatorios.forEach(campo => {
            req.assert(campo, `O campo '${campo}' é obrigatório!`).notEmpty();
        });

        resp.errors = req.validationErrors() || [];

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const usernameExists = await User.GetFirst(`username = '${body.username}'`);
        let userid = '';

        if (!usernameExists) {
            const login = await ServiceDesk.Login(body.username, body.password);

            if (login.status !== 1) {
                resp.errors.push({
                    msg: 'Erro ao realizar login'
                });
                return res.status(401).send(resp);
            }

            const contact = await ServiceDesk.GetContact(login.data, body.username);

            if (contact.status !== 1) {
                resp.errors.push({
                    msh: "Erro ao encontrar usuário no Service Desk"
                });
                return res.status(500).send(resp);
            }

            const user = {
                id: Util.generateId(),
                ...contact.data
            };

            user.password = Crypto.Encrypt(body.password, user.id);

            const contactExists = await User.GetFirst(`external_id = '${user.external_id}'`);
            if (contactExists) {
                user.id = contactExists.id;
                user.password = Crypto.Encrypt(body.password, user.id);
                await User.Update(user, `id = '${contactExists.id}'`);
            } else {
                const createUser = await User.Create(user);

                if (createUser.status === 1) {
                    const roles = [];

                    if (user.access_type.toLowerCase().startsWith('admin')) {
                        const adminRole = await Role.GetFirst(`name = 'administrator'`);
                        roles.push(adminRole.id);
                    }

                    const userRole = await Role.GetFirst(`name = 'user'`);

                    roles.push(userRole.id);

                    roles.forEach(roleId => {
                        UserRole.Create({
                            id: Util.generateId(),
                            user: user.id,
                            role: roleId
                        });
                    });
                }
            }

            userid = user.id;
        } else {
            userid = usernameExists.id;

            if (Crypto.Decrypt(usernameExists.password, usernameExists.id) !== body.password) {
                resp.errors.push({
                    msg: "Senha incorreta!"
                });
                return res.status(401).send(resp);
            }

            const login = await ServiceDesk.Login(body.username, body.password);
            if (login.status !== 1) {
                resp.errors.push({
                    msg: 'Erro ao realizar login'
                });
                return res.status(401).send(resp);
            }
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
        
        if(session){
            const logout = await Session.Delete(`ìd = '${headers['authorization']}'`);
            if(logout.status !== 1){
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

};