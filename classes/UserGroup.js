class UserGroup extends Classes{

    static table = 'user_group';
    static fields = [ 'id', 'user', 'group' ];

}

module.exports = UserGroup;