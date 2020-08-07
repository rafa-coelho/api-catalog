class Role extends Classes
{
    static entity = 'role';
    static table = 'role';
    static fields = [ 'id', 'name', 'label', 'description' ];
}

module.exports = Role;