class OfferingField extends Classes{

    static table = 'offering_field';
    static fields = [ 'id', 'name', 'label', 'multiple', 'automatic', 'type', 'offering' ];

}

module.exports = OfferingField;