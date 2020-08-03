class Session extends Classes
{
    static entity = 'sess';
    static table = 'session';
    static fields = [ 'id', 'external_id', 'user', 'status', 'deleted' ];
};

module.exports = Session;