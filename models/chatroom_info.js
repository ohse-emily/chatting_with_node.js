const Sequelize = require('sequelize');

module.exports = class Chat extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            chatRoom_name:{
                type:Sequelize.STRING(100),
                allowNull:false,
                unique:true,
            },
            chatRoom_nickname:{
                type:Sequelize.STRING(100),
                allowNull:false,
            },
            radio:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
            },
            chatRoom_password1:{
                type:Sequelize.STRING(100),
                allowNull:true,
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
            modelName:"Chat",
            tableName:"chatroom_info",
            charset:"utf8",
            collate:"utf8_general_ci",
        })
    }
    //static associate(db){}
}


