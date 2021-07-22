const {Chat} = require('../../models');


let chat = async (req,res)=>{
    let chatroom_info = await Chat.findAll({})
    let room_arr = []
    if(chatroom_info.length>0){
        for (let i=0; i<chatroom_info.length; i++){
            let data = chatroom_info[i].dataValues
            room_arr.push([i, data.chatRoom_name, data.chatRoom_nickname, data.radio])
        }
        console.log(room_arr)
        res.render('chat.html', {room_arr})
    }else{
        res.render('chat.html')
    }
}



// 채팅방 만들기 
let openChatRoom = (req,res)=>{
    res.render('openChatRoom.html')
}



// 방장 open chat room - 새로 만들 채팅방 정보 받기
let openChatInfo = (req,res)=>{
    let {chatRoom_name,chatRoom_nickname,radio, chatRoom_password1} = req.body;
    // DB insert 
    Chat.create({
        chatRoom_name,chatRoom_nickname,radio, chatRoom_password1,
    })
    //radio==1 오픈채팅 / 0 비공개방 
    if (radio==1){radio1='오픈 채팅'};
    if (radio==0){radio1='비공개 채팅'};

    res.render('chattingRoom.html', {
        chatRoom_name,chatRoom_nickname,radio1, chatRoom_password1,
    })
}

// user가 닉네임 / pw 입력할 html 보내기 
let user_write_id = (req,res) =>{
    let {chatRoom_nickname, chatRoom_name, radio, flag,} = req.query;
    console.log(chatRoom_nickname, chatRoom_name, radio, flag,)
    res.render('user_write_id.html', {chatRoom_nickname, chatRoom_name, radio, flag,})
}

// user의 채팅방 비밀번호 확인 
let chatRoom_pw_check = async (req,res)=>{
    let result = false;
    let {chatRoom_name, user_password} = req.query;
    let pw_check = await Chat.findOne({ where: { chatRoom_name } })    
    let {chatRoom_password1} = pw_check.dataValues;
    if (chatRoom_password1 == user_password){
        result = true;
    }
    res.json({result})
}


// user goto chat room 
let user_goto_chatroom = async(req,res)=>{
    let {chatRoom_name} = req.query;
    let chatRoom_confirm = await Chat.findOne({ where: { chatRoom_name } })    
    let {chatRoom_nickname,radio,chatRoom_password1} = chatRoom_confirm.dataValues
    console.log(chatRoom_name, chatRoom_nickname,radio,chatRoom_password1)

    res.render('chattingRoom.html', {
        chatRoom_name,
        chatRoom_nickname,
        'radio1':radio, 
        chatRoom_password1,
    })
}


// user 채팅방 입장 
let user_goto_chatroom_by_post = async(req,res)=>{
    let {user_nickname, chatRoom_nickname, chatRoom_name, radio} = req.body;
    console.log(user_nickname, chatRoom_nickname, chatRoom_name, radio);
    if (radio=='true'){radio1='오픈 채팅'};
    if (radio=='false'){radio1='비공개 채팅'};
    res.render('chattingRoom.html',{user_nickname, chatRoom_nickname,chatRoom_name,radio1})
}






module.exports={
    chat, 
    openChatRoom, 
    openChatInfo, 
    user_goto_chatroom, 
    user_write_id, 
    chatRoom_pw_check,
    user_goto_chatroom_by_post,

}