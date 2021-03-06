class Request extends Classes
{
    static entity = "req";
    static table = "request";
    static fields = [ "id", "user", "offering", "code", "analyst", "summary", "type", "status", "created_at", "updated_at" ];

    static Create(data){
        data.status = 1;
        data._status = "created";
        data.created_at = new Date().toJSON();
        return Classes.Create.bind(this)(data);
    }

    static Update(data, where){
        data._status = "updated";
        data.updated_at = new Date().toJSON();
        return Classes.Update.bind(this)(data, where);
    }

}

module.exports = Request;