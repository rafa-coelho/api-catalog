const knex = require('../database/connection');
const db = require("mysql");
const { off, whereRaw } = require('../database/connection');


const con = db.createPool({
    host:  "127.0.0.1",
    user: "root",
    password: "",
    database: "catalog"
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
    
    
    async Get(){
        const where = (this.where != "" && this.where != undefined) ? this.where : "";
        const order_by = (this.order_by) ? this.order_by : "id desc";
        let limit = (this._limit) ? this._limit : 1000000;
        let offset = (this._offset) ? this._offset : 0;

        
        if(limit){
            if(limit.toString().indexOf(',') >= 0){
                offset = limit.split(',')[0].replace(/\D+/g, '')
                limit = limit.split(',')[1].replace(/\D+/g, '')
            }
        }

        const data = await knex(this.table)
            .whereRaw(where)
            .orderByRaw(order_by)
            .limit(limit)
            .offset(offset);

        return data;
    }
    
    async Insert(){
        const obj = {};

        for (const param in this) {
            if (this.hasOwnProperty(param)) {
                const ignore = [ "table", "where", "db" ];

                const field = this[param];
                if(typeof(field) == "function" || ignore.includes(param))
                    continue;
                
                obj[param] = field;
            }
        }

        return await knex(this.table).returning('id').insert(obj);
    }
    
    async Update(callback){
        const where = (this.where != "" && this.where != undefined) ? this.where : "";

        const obj = {};

        for (const param in this) {
            if (this.hasOwnProperty(param)) {
                const ignore = [ "table", "where", "db" ];

                const field = this[param];
                if(typeof(field) == "function" || ignore.includes(param))
                    continue;
                
                obj[param] = field;
            }
        }

        return await knex(this.table)
            .whereRaw(where)
            .update(obj);
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