class UserPermission extends Classes
{
    static entity = 'up';
    static table = 'user_permission';
    static fields = [ 'id', 'user', 'action' ];

}

module.exports = UserPermission;