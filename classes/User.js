class User extends Classes
{
    static entity = 'usr';
    static table = 'user';
    static fields = [ 'id', 'external_id', 'name', 'email', 'username', 'password', 'access_type', 'status' ];

    static async ExternalLogin(id){
        const resp = {
            status: 0
        };

        const user = await User.GetFirst(`id = '${id}'`);
        const login = await ServiceDesk.Login(user.username, Crypto.Decrypt(user.password, user.id));

        if (login.status !== 1) {
            resp.msg = 'Erro ao realizar login';
        }else{
            resp.status = 1;
            resp.data = login.data;
        }

        return resp;
    }

}

module.exports = User;