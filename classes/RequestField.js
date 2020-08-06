class RequestField extends Classes
{
    static entity = 'rfld';
    static table = 'request_field';
    static fields = [ 'id', 'request', 'field', 'value', 'deleted' ];
}

module.exports = RequestField;