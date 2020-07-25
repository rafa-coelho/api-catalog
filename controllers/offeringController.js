module.exports = (app) => {

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