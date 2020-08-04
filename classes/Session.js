class Session extends Classes
{
    static entity = 'sess';
    static table = 'session';
    static fields = [ 'id', 'user', 'status', 'deleted' ];
};

module.exports = Session;