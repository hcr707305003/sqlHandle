var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

class sqliteHandle {
    tableName = '';
    saveData = {};
    saveFieldStr = '';
    saveFields = [];
    saveValueStr = '';
    saveValues = [];
    saveStr = '';
    fieldData = ['*'];
    fieldStr = '*';
    whereData = [];
    whereStr = '';
    countStr = '';
    countAsStr = '';
    sumStr = '';
    sumAsStr = '';
    andStr = 'and';
    orStr = 'or';
    orderData = [];
    orderStr = '';
    groupData = [];
    groupStr = '';
    limitStr = '';
    joinStr = '';
    updateData = [];
    updateStr = '';
    transactionStr = 'BEGIN;';//开启事务
    rollbackStr = 'ROLLBACK;';//事务回滚
    commitStr = 'COMMIT;';//事务提交

    //初始化
    constructor(file = 'test.db') {
        this.distructorData = JSON.parse(JSON.stringify(this));//存储析构参数
        this.createDatabase(file); //默认创建数据库
    }

    //设置表
    table(tableName = '') {
        this.tableName = tableName;
        return this;
    }

    //创建表
    create(sql = '') {
        this.sql = sql;
        return this.createTable('queay');
    }

    //保存
    save(data = {}, prepare = false) {
        for (let i in data) {
            this.saveValues.push(data[i]);
            this.saveFields.push(i);
            this.saveFieldStr += `,${i}`;
            if (prepare == true) {
                this.saveValueStr += `,?`;
            } else {
                data[i] = this.setValueType(data[i]);
                this.saveValueStr += `,'${data[i]}'`;
            }
        }
        this.saveFieldStr = '(' + this.ltrim(this.saveFieldStr, ',') + ')'; //组合的字段
        this.saveValueStr = 'values(' + this.ltrim(this.saveValueStr, ',') + ')'; //组合的字段
        return this.createTable('save');
    }

    //更新
    update(updateData = [], prepare = false) {
        this.updateData = updateData;
        for (let i in updateData) {
            updateData[i] = this.setValueType(updateData[i]);
            this.updateStr += `,${i}=${updateData[i]}`;
        }
        this.updateStr = this.ltrim(this.updateStr, ',');
        return this.createTable('update');
    }

    //删除
    delete() {
        return this.createTable('delete');
    }

    //查询
    select(field = '') {
        if (field != '' && field.constructor == String) this.fieldStr = field;
        if (field.constructor == Array) this.field(field);
        return this.createTable('select');
    }

    //统计
    count(as = '') {
        this.countStr = 'count(*)';
        if(as != '' && as.constructor == String) this.countAsStr = `as ${as}`;
        return this.createTable('count');
    }

    //总计
    sum(field = '',as = '') {
        this.sumStr = `sum(${field})`;
        if(as != '' && as.constructor == String) this.sumAsStr = `as ${as}`;
        return this.createTable('sum');
    }

    //联合查询
    join(table = '', on = '') {
        if (table != '' && on != '') this.joinStr += `inner join ${table} ON ${on}`;
        return this;
    }

    //左联查询
    leftjoin(table = '', on = '') {
        if (table != '' && on != '') this.joinStr += `left join ${table} ON ${on}`;
        return this;
    }

    //右联查询
    rightjoin(table = '', on = '') {
        if (table != '' && on != '') this.joinStr += `right join ${table} ON ${on}`;
        return this;
    }

    //where条件
    where(where = []) {
        let init = this.andStr;
        this.whereData = where;
        where.forEach(item => {
            this.strToArray(item[0], '|').forEach((condition, index) => {
                //条件拼接
                init = this.strToArray(item[0], '|').length > 1 ? this.orStr : this.andStr;
                if (item.length == 3) {
                    this.strToArray(item[2], '|').forEach((condition1, index1) => {
                        condition1 = this.setValueType(condition1);
                        this.whereStr += `${init} ${condition} ${item[1]} ${condition1} `;
                    })
                } else if (item.length == 2) {
                    this.strToArray(item[1], '|').forEach((condition1, index1) => {
                        condition1 = this.setValueType(condition1);
                        this.whereStr += `${init} ${condition} = ${condition1} `;
                    })
                }
            });
        });
        this.whereStr = this.ltrim(this.whereStr, this.andStr);
        this.whereStr = this.ltrim(this.whereStr, this.orStr);
        return this;
    }

    //group by 分组
    group(group = []) {
        this.groupData = group;
        group.forEach(item => {
            this.groupStr += `,${item}`;
        });
        this.groupStr = this.ltrim(this.groupStr, ','); //组合的字段
        return this;
    }

    //order by排序
    order(order = {}) {
        this.orderData = order;
        for (let i in order) {
            this.orderStr += `,${i} ${order[i]}`;
        }
        this.orderStr = this.ltrim(this.orderStr, ',');
        return this;
    }

    //查询的字段
    field(field = ['*']) {
        this.fieldData = field;
        this.fieldStr = '';
        field.forEach(item => {
            this.fieldStr += `,${item}`;
        });
        this.fieldStr = this.ltrim(this.fieldStr, ',');
        return this;
    }

    //limit条数和页数
    limit(page = 0, limit = 0) {
        if (page != 0) this.limitStr += page;
        if (limit != 0) this.limitStr += `,${limit}`;
        this.limitStr = this.ltrim(this.limitStr, ',');
        return this;
    }

    //开始事务
    transaction() {
        return this.promise(this.transactionStr);
    }

    //回滚事务
    rollback() {
        return this.promise(this.rollbackStr);
    }

    //提交事务
    commit() {
        return this.promise(this.commitStr);
    }

    //类型转换
    setValueType(value, index = 0) {
        let init = value;
        if (!index && value != null) {
            switch (value.constructor) {
                case Number:
                    init = value;
                    break;
                case String:
                    init = `'${value}'`;
                    break;
                case Boolean:
                    init = value;
                    break;
                default:
                    break;
            }
        }
        return init;
    }

    //左切割
    ltrim(str, char) {
        return str.replace(eval(`/^${char}/`), '');
    }

    //右切割
    rtrim(str, char) {
        return str.replace(eval(`/${char}$/`), '');
    }

    //字符串转数组
    strToArray(str, s = ',') {
        if (typeof (str) == 'string') {
            return str.split(s);
        } else {
            let arr = [];
            arr.push(str);
            return arr;
        }
    }

    //同步
    promise(sql) {
        return new Promise((resolve, reject) => {
            this.run(sql, (object) => {
                resolve(object)
            });
        });
    }

    //析构函数
    destructor() {
        for (let property in this.distructorData) {
            this[property] = this.distructorData[property]
        }
    }

    //创建sql语句
    createTable(sign = '') {
        let table = '';
        switch (sign) {
            case 'save':
                table = `insert into ${this.tableName} ${this.saveFieldStr} ${this.saveValueStr};`;
                this.queryData = this.promise(table);
                this.sql = table;//保存最后的语句
                break;
            case 'select':
                table = `select ${this.fieldStr} from ${this.tableName}`;
                if (this.joinStr.trim() != '') table += ` ${this.joinStr}`;
                if (this.whereStr.trim() != '') table += ` where ${this.whereStr}`;
                if (this.groupStr.trim() != '') table += ` group by ${this.groupStr}`;
                if (this.orderStr.trim() != '') table += ` order by ${this.orderStr}`;
                if (this.limitStr.trim() != '') table += ` limit ${this.limitStr};`;
                //执行查询语句
                this.queryData = new Promise((resolve, reject) => {
                    this.query(table, (object) => {
                        resolve(object)
                    });
                });
                this.sql = table;//保存最后的语句
                break;
            case 'count':
                table = `select ${this.countStr} ${this.countAsStr} from ${this.tableName}`;
                if (this.joinStr.trim() != '') table += ` ${this.joinStr}`;
                if (this.whereStr.trim() != '') table += ` where ${this.whereStr}`;
                //执行查询语句
                this.queryData = new Promise((resolve, reject) => {
                    this.query(table, (object) => {
                        resolve(object)
                    });
                });
                this.sql = table;//保存最后的语句
                break;
            case 'sum':
                table = `select ${this.sumStr} ${this.sumAsStr} from ${this.tableName}`;
                if (this.joinStr.trim() != '') table += ` ${this.joinStr}`;
                if (this.whereStr.trim() != '') table += ` where ${this.whereStr}`;
                //执行查询语句
                this.queryData = new Promise((resolve, reject) => {
                    this.query(table, (object) => {
                        resolve(object)
                    });
                });
                this.sql = table;//保存最后的语句
                break;
            case 'update':
                table = `update ${this.tableName}`;
                if (this.updateStr.trim() != '') table += ` set ${this.updateStr}`;
                if (this.whereStr.trim() != '') table += ` where ${this.whereStr};`;
                this.queryData = this.promise(table);
                this.sql = table;//保存最后的语句
                break;
            case 'delete':
                table = `delete from ${this.tableName}`;
                if (this.whereStr.trim() != '') table += ` where ${this.whereStr};`;
                this.queryData = this.promise(table);
                this.sql = table;//保存最后的语句
                break;
            case 'queay':
                this.queryData = this.promise(table);
                break;
            default:
                break;
        }
        console.log(this.sql)
        this.destructor();//析构函数
        return this.queryData;//返回的数据

    }

    //创建数据库
    createDatabase(file) {
        this.DB = {};
        this.DB.db = new sqlite3.Database(file);
        this.DB.exist = fs.existsSync(file);
        if (!this.DB.exist) {
            fs.openSync(file, 'w');
        }
    }

    //执行sql语句
    run(sql, callback) {
        this.DB.db.serialize(()=>{
            this.DB.db.run(sql, function(err){
                if (null != err) {
                    return;
                }
                if (callback) {
                    callback(err);
                } 
            });
        });
    }

    //查询sql语句
    query(sql, callback) {
        this.DB.db.all(sql, function (err, rows) {
            if (null != err) {
                return;
            }
            if (callback) {
                callback(rows);
            }
        });
    }
}

module.exports = sqliteHandle;