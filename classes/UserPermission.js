class UserPermission extends Classes {
    static entity = 'up';
    static table = 'user_permission';
    static fields = ['id', 'user', 'action'];


    static async CreateUserPermission(userId, access_type) {
        const roles = [];

        if (access_type.toLowerCase().startsWith('admin')) {
            const adminRole = await Role.GetFirst(`name = 'administrator'`);
            roles.push(adminRole.id);
        }

        const userRole = await Role.GetFirst(`name = 'user'`);

        roles.push(userRole.id);

        roles.forEach(async roleId => {
            UserRole.Create({
                id: Util.generateId(),
                user: userId,
                role: roleId
            });

            const permissions = await RolePermission.Get(`role = '${roleId}'`);
            permissions.forEach(permission => {
                UserPermission.Create({
                    id: Util.generateId(),
                    user: userId,
                    action: permission.action
                });
            });

        });
    }
}

module.exports = UserPermission;