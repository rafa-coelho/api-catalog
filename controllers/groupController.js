module.exports = (app) => {

    app.get(`/group`, async (req, res) => {
        const { headers, query } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const session = await Session.Validar(headers['authorization'], 'get.group');

        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        
        const userRoles = await Role.GetUserRoles(session.data.user);
        


        const where = (query.where) ? query.where : "";
        const order_by = (query.order_by) ? query.order_by : "";
        const limit = (query.limit) ? query.limit : "";

        const requests = await Group.Get(where, order_by, limit);

        resp.status = 1;
        resp.data = requests;
        res.send(resp);
    });

};