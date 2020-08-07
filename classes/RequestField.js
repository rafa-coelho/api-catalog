class RequestField extends Classes
{
    static entity = 'rfld';
    static table = 'request_field';
    static fields = [ 'id', 'request', 'name', 'value' ];
}

module.exports = RequestField;