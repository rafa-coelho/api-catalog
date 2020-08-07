class Session extends Classes
{
    static entity = 'sess';
    static table = 'session';
    static fields = [ 'id', 'user', 'status', 'deleted' ];

    static async Validar(id = null){
        const response = {
            status: false,
            data: null
        };

        if([ "", null ].includes(id)){
            response.msg = "A Session ID precisa ser informada!"
        }else{
            const sessao = await this.GetFirst(`id = '${id}' AND deleted = 0`);

            if(!sessao){
                response.msg = "Sessão inválida!";
            }else{
                response.status = 1
                response.data = sessao;
            }

        }

        return response;
    }

};

module.exports = Session;