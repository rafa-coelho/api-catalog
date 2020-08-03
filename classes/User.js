class User extends Classes
{
    static entity = 'usr';
    static table = 'user';
    static fields = [ 'id', 'external_id', 'name', 'email', 'password', 'access_type', 'status', 'deleted' ];
}

module.exports = User;