class Session extends Classes
{
    static entity = 'sess';
    static table = 'session';
    static fields = [ 'id', 'user', 'status' ];

    static async Validar(id = null, action){
        const response = {
            status: false,
            data: null
        };

        if([ "", null ].includes(id)){
            response.msg = "A Session ID precisa ser informada!"
        }else{
            const sessao = await this.GetFirst(`id = '${id}'`);

            if(!sessao){
                response.msg = "Sessão inválida!";
            }else{
                const userRoles = await UserRole.Get(`user = '${sessao.user}'`);
                const hasPermission = (await RolePermission.Count(`role in ('${userRoles.map(x => x.id).join(`', '`) }') AND action = '${action}'`)) > 0;

                if(!hasPermission){
                    response.msg = "Você não tem permissão para realizar esta ação!"
                }else{
                    response.status = 1
                    response.data = { 
                        ...sessao,
                        roles: (await Role.Get(`id in ('${userRoles.map(x => x.role).join(`', '`) }')`)).map(x => x.name)
                    };
                }
            }
        }

        return response;
    }

};

module.exports = Session;