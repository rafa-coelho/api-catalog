const db = require("mysql");

const con = db.createPool({
    host:  "127.0.0.1",
    user: "root",
    password: "",
    database: "catalogui"
});

class DB
{
    constructor(table){

        this.table = table;
    }

    Where(where){
        this.where = where;
    }

    Limit(limit){
        this._limit = limit;
    }
    
    
    Get(callback){
        return new Promise(resolve => {
            const where = (this.where != "" && this.where != undefined) ? " WHERE " + this.where : "";
            const order_by = (this.order_by) ? " ORDER BY " + this.order_by : "";
            const limit = (this._limit) ? " LIMIT " + this._limit : "";
            con.query("SELECT * FROM " + this.table + where + order_by + limit, (err, result) => {
                if(typeof callback == "function")
                    callback(result);
                resolve(result);
            });
        });
    }
    
    Insert(callback){
        return new Promise(resolve => {
            let fields = "(";
            let values = "(";
            
            let c = 0;
            for(let param in this){
                const key = param;
                const value = Util.mysql_real_escape_string(this[param]);
                c++;
                
                const ignore = [ "table", "where", "db" ];
                
                if(typeof(value) == "function" || ignore.includes(key))
                    continue;
        
                fields += key + ((c < Util.objCount(this)) ? ", " : ")");
                values += "'" + value + "'" + ((c < Util.objCount(this)) ? ", " : ")");
            }
            
            const query = "INSERT INTO `" + this.table + "` " + fields + " VALUES " + values;
            
            con.query(query, function(err, res){
                if(typeof callback == "function")
                    callback(res);
                resolve(res);
            });

        });
    }
    
    Update(callback){
        return new Promise(resolve => {
            let fields = "";
            let c = 1;
            for(let param in this){
                const key = param;
                const value = Util.mysql_real_escape_string(this[param]);
                c++;
                
                const ignore = [ "table", "where", "db" ];
                if(typeof(value) == "function" || ignore.includes(key))
                    continue;

                fields += key + " = '" + value + "'" + ((c < Util.objCount(this)) ? ", " : "");
            }
        
            const where = (this.where != "" && this.where != undefined) ? " WHERE " + this.where : "";
            const query = "UPDATE `" + this.table + "` SET " + fields + where;
            
            con.query(query, function(err, res){ 
                if(typeof callback == "function")
                    callback(res);
                resolve(res);
            });

        });
    }
    
    Delete(callback){
        return new Promise(resolve => {
            const where = (this.where != "" && this.where != undefined) ? " WHERE " + this.where : "";
            con.query("DELETE FROM " + this.table + where, function(err, result){ 
                if(typeof callback == "function")
                    callback(result);
                resolve(result);
            });
        });
    }
    
    Inner(tabela, campo){
        this.inner = " LEFT JOIN " + tabela + " ON " + this.table + "." + campo + " = " + tabela + ".id ";
    }

    OrderBy(order_by){
        this.order_by = order_by;
    }

    Query(query){
        return new Promise(resolve => {
            con.query(query, (err, result) => {
                resolve(result);
            });
        })
    }

}


module.exports = DB;