class Role extends Classes {
    static entity = 'role';
    static table = 'role';
    static fields = ['id', 'name', 'label', 'description'];

    static async GetUserRoles(userId) {
        const userRoles = await UserRole.Get(`user = '${userId}'`);
        return (await Role.Get(`id in ('${userRoles.map(x => x.role).join(`', '`)}')`)).map(x => x.name);
    }

    static async AddUserRole(userId, roleId){
        return (await UserRole.Create({
            id: Util.generateId(),
            user: userId,
            role: roleId
        })).status === 1;
    }

}

module.exports = Role;