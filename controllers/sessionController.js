module.exports = function(app){

    // [GET] => /session
    app.get(`/session`, async (req, res) => {
        const query = req.query;
        var resp = {};
        resp.status = 0;
        resp.data = null;
        resp.errors = [];

        const session = await Session.Validar(req.headers['authorization'], 'post.user');
        
        if (!session.status) {
            resp.errors.push({
                location: "header",
                param: "Authorization",
                msg: session.msg
            });
            return res.status(403).send(resp);
        }

        if(session.status !== 1){
            resp.errors.push(
                {
                    "param": "sid",
                    "msg": session.msg
                }
            );
            
            res.status(403).send(resp);
            return;
        }
        
        res.send(session);
    });

};