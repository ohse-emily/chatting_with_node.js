const Sequelize = require('sequelize');

module.exports = class Chat_user extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            chatRoom_name:{
                type:Sequelize.STRING(100),
                allowNull:false,
                unique:false,
            },
            chatRoom_user:{
                type:Sequelize.STRING(100),
                allowNull:false,
            },
            user_socketID:{
                type:Sequelize.STRING(100),
                allowNull:false,
            },
            userdt:{
                type:Sequelize.DATE,
                allowNull:false,
                defaultValue:Sequelize.NOW,
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            paranoid:false,
            modelName:"Chat_user",
            tableName:"chat_users",
            charset:"utf8",
            collate:"utf8_general_ci",
        })
    }
    //static associate(db){}
}


