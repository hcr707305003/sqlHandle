const sqliteHandle = require('./sqliteHandle');

//实例化
var sqlite = new sqliteHandle('test.db');

//建表
sqlite.create('create table if not exists `tp_practices_consumption_order_goods` (\n' +
    '  `id` INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
    '  `order_no` TEXT,\n' +
    '  `money` REAL,\n' +
    '  `unit_price` REAL,\n' +
    '  `amount` INTEGER,\n' +
    '  `unit` TEXT,\n' +
    '  `verification_code` TEXT,\n' +
    '  `coupon_face_value` REAL,\n' +
    '  `coupon_client_take` REAL,\n' +
    '  `coupon_commercial_tenant_take` REAL,\n' +
    '  `commercial_tenant_vertical_reduction` REAL,\n' +
    '  `integral_deduction` REAL,\n' +
    '  `client_actually_paid` REAL,\n' +
    '  `goods` TEXT,\n' +
    '  `integral_deduction_money` REAL,\n' +
    '  `goods_type` INTEGER,\n' +
    '  `oil_gun` INTEGER,\n' +
    '  `lpm` REAL,\n' +
    '  `pump` REAL,\n' +
    '  `activity_name` TEXT,\n' +
    '  `oil_type` INTEGER,\n' +
    '  `source` INTEGER,\n' +
    '  `create_time` INTEGER,\n' +
    '  `update_time` INTEGER,\n' +
    '  `admin_id` TEXT,\n' +
    '  `delete_time` INTEGER\n' +
    ');');

//建表
sqlite.create('create table if not exists `tp_practices_consumption_order` (\n' +
    '    id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
    '    order_time INTEGER,\n' +
    '    order_no TEXT,\n' +
    '    member_no TEXT,\n' +
    '    serial_no TEXT,\n' +
    '    money REAL,\n' +
    '    penny_money REAL,\n' +
    '    coupon_face_value REAL,\n' +
    '    coupon_client_take REAL,\n' +
    '    coupon_commercial_tenant_take REAL,\n' +
    '    activity_name TEXT,\n' +
    '    commercial_tenant_vertical_reduction REAL,\n' +
    '    vertical_reduction_activity_name TEXT,\n' +
    '    integral_deduction REAL,\n' +
    '    integral_deduction_money REAL,\n' +
    '    third_party_discounts REAL,\n' +
    '    client_actually_paid REAL,\n' +
    '    procedures_charge REAL,\n' +
    '    settlement_account_amount REAL,\n' +
    '    finance_center_settlement_channel_id INTEGER,\n' +
    '    pay_mode INTEGER,\n' +
    '    payment_code TEXT,\n' +
    '    plate_number TEXT,\n' +
    '    remark TEXT,\n' +
    '    invoice_money REAL,\n' +
    '    unused_invoice_money REAL,\n' +
    '    bargain_money REAL,\n' +
    '    company TEXT,\n' +
    '    mobile TEXT,\n' +
    '    presented_money REAL,\n' +
    '    balance_pay REAL,\n' +
    '    device_no TEXT,\n' +
    '    sponsor_mode INTEGER,\n' +
    '    channel_discounts REAL,\n' +
    '    channel_assume REAL,\n' +
    '    oil_companies_assume REAL,\n' +
    '    service_charge REAL,\n' +
    '    station_no TEXT,\n' +
    '    pay_qr_code_id INTEGER,\n' +
    '    channel_config_id INTEGER,\n' +
    '    consumption_type INTEGER,\n' +
    '    is_recharge_gratis INTEGER,\n' +
    '    is_authorization_consumption INTEGER,\n' +
    '    order_status INTEGER,\n' +
    '    member_balance REAL,\n' +
    '    member_add_balance REAL,\n' +
    '    controlled_enterprise_id INTEGER,\n' +
    '    pay_directional INTEGER,\n' +
    '    marketing_coupon_activity_id INTEGER,\n' +
    '    jssdk BLOB,\n' +
    '    cart_employee_id INTEGER,\n' +
    '    revoke_time INTEGER,\n' +
    '    source INTEGER,\n' +
    '    practices_shift_record_id INTEGER,\n' +
    '    create_time INTEGER,\n' +
    '    update_time INTEGER,\n' +
    '    admin_id INTEGER,\n' +
    '    delete_time INTEGER \n' +
    ');\n' +
    '\n' +
    'CREATE UNIQUE INDEX "order_time"\n' +
    'ON "tp_practices_consumption_order" (\n' +
    '  "order_time" COLLATE BINARY ASC\n' +
    ');');

//开启事务
sqlite.transaction();
//保存
sqlite.table('tp_practices_consumption_order').save({
    'order_time': 2222
});
//事务回滚
// sqlite.rollback().then((data)=>{
//     //获取数据
//     console.log(data)
// });
//提交事务
sqlite.commit().then((data)=>{
    //获取数据
    console.log(data)
});


// 删除
sqlite.table('tp_practices_consumption_order').where([
    ['id',7],
]).delete().then((data)=>{
    //获取数据
    console.log(data)
});


// //更新
sqlite.table('tp_practices_consumption_order').where([
    ['id',3]
]).update({
    'member_no' : 22222,
    'order_no' : 'aaaaa'
}).then((data)=>{
    //获取数据
    console.log(data)
});


//查询
sqlite.table('tp_practices_consumption_order')
    .leftjoin('tp_practices_consumption_order_goods', 'tp_practices_consumption_order_goods.order_no = tp_practices_consumption_order.order_no')
    .field([
        'tp_practices_consumption_order.order_no',
        'tp_practices_consumption_order.member_no',
    ])
    .where([
        ['tp_practices_consumption_order.member_no|tp_practices_consumption_order.order_no', 'is', null],
        // ['tp_practices_consumption_order.member_no', '=', '1111'],
    ])
    .group(['tp_practices_consumption_order.order_no'])
    .order({
        order_time: 'DESC',
    })
    .limit(0, 1)//条数
    .select().then((data) => {
        //获取数据
        console.log(data)
    });




//统计 方式一：
sqlite.table('tp_practices_consumption_order').count('count').then((data)=>{
    //获取数据
    console.log(data)
});
//统计 方式二:
sqlite.table('tp_practices_consumption_order').select('count(*) as count').then((data)=>{
    //获取数据
    console.log(data)
});
//统计 方式三:
sqlite.table('tp_practices_consumption_order').field([
    'count(*) as count'
]).select().then((data)=>{
    //获取数据
    console.log(data)
});




//总计 方式一:
sqlite.table('tp_practices_consumption_order').sum('order_no','order_no').then((data)=>{
    //获取数据
    console.log(data)
});
//总计 方式二:
sqlite.table('tp_practices_consumption_order').select('sum(order_no) as order_no').then((data)=>{
    //获取数据
    console.log(data)
});
//总计 方式三:
sqlite.table('tp_practices_consumption_order').field([
    'sum(order_no) as order_no'
]).select().then((data)=>{
    //获取数据
    console.log(data)
});
