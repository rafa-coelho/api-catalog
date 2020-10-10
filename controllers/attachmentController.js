module.exports = (app) => {

    // [POST] => /request/:id/attachment
    app.post(`/request/:id/attachment`, async (req, res) => {
        const { headers, params, files } = req;
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

        if (!files || !files.file) {
            resp.errors.push({
                msg: "Você precisa fornecer um arquivo!"
            });
            return res.status(400).send(resp);
        }

        const request = await Request.GetFirst(`id = '${params.id}'`);

        if (!request) {
            resp.errors.push({
                msg: "Chamado não encontrado"
            });
            return res.status(404).send(resp);
        }

        try{
            const file = files.file;
            const dir = `${ROOT}\\media`;
            const fs = require('fs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            const payload = {
                id: Util.generateId(),
                request: params.id,
                name: `${(new Date()).getTime()}_${file.name}`,
                type: file.mimetype
            };

            file.mv(`${dir}\\${payload.name}`);
            
            const create = await Attachment.Create(payload);
            if(create.status !== 1){
                resp.errors.push({
                    msg: "Erro ao adicionar Anexo!"
                });
                return res.status(500).send(resp);
            }
    
            resp.status = 1;
            resp.msg = "Anexo adicionado com sucesso!";
            resp.data = payload;
            res.send(resp);
        }catch(e){
            resp.errors.push({
                msg: e
            });
            return res.status(500).send(resp);
        }
        
        
    });

};