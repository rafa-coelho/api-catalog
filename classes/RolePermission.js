class RolePermissio extends Classes
{
    static entity = 'rp';
    static table = 'role_permission';
    static fields = [ 'id', 'role', 'action' ];
}

module.exports = RolePermissio;