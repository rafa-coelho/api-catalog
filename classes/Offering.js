class Offering extends Classes{

    static table = 'offering';
    static fields = [ 'id', 'name', 'company', 'type', 'external_id' ];

}

module.exports = Offering;