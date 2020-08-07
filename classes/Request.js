class Request extends Classes
{
    static entity = "req";
    static table = "request";
    static fields = [ "id", "user", "offering", "summary", "status", "created_at", "updated_at" ];

    static Create(data){
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