const Classes = require("../utils/Classes");

class Offering extends Classes{

    static table = 'offering';
    static fields = [ 'id', 'name', 'label', 'multiple', 'type' ];

}

module.exports = Offering;