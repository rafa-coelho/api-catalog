class UserRole extends Classes
{
    static entity = 'ur';
    static table = 'user_role';
    static fields = [ 'id', 'user', 'role' ];
}

module.exports = UserRole;