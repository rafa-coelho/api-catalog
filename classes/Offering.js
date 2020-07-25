class Offering extends Classes{

    static table = 'offering';
    static fields = [ 'id', 'name', 'external_id', 'deleted' ];

}

module.exports = Offering;