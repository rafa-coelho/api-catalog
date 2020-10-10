class Attachment extends Classes
{
    static entity = 'ATCH';
    static table = 'attachment';
    static fields = [ 'id', 'request', 'name', 'type' ];
}

module.exports = Attachment;