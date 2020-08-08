class Role extends Classes {
    static entity = 'role';
    static table = 'role';
    static fields = ['id', 'name', 'label', 'description'];

    static async GetUserRoles(userId) {
        const userRoles = await UserRole.Get(`user = '${userId}'`);
        return (await Role.Get(`id in ('${userRoles.map(x => x.role).join(`', '`)}')`)).map(x => x.name);
    }

}

module.exports = Role;