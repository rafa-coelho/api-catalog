class Request extends Classes
{
    static entity = "req";
    static table = "request";
    static fields = [ "id", "user", "offering", "summary", "status", "created_at", "updated_at" ];
}

module.exports = Request;