require('dotenv').config();
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser')
const port = process.env.PORT
const socket = require('socket.io')
const http = require('http');
const server = http.createServer(app);
const io = socket(server); // socket 과 server 연결 
const router = require('./router/index');
const cors = require('cors');
const { sequelize } = require('./models')
const { Chat, Chat_user } = require('./models');

sequelize.sync({ force: true })
    .then(() => { console.log('접속 성공') })
    .catch(() => { console.log('접속 실패') })

nunjucks.configure('view', {
    express: app
});
app.set('view engine', 'html');
app.use(express.static('public/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/', router);


let blacklist = [];
io.sockets.on('connection', (socket) => {

    // 채팅방 join room
    socket.on('join', async (joinData) => {
        let { room, user_nickname, chatRoom_nickname } = joinData;
        socket.join(room)

        let chatRoom_user;
        let chatRoom_name = room;
        let user_socketID = socket.id;

        // 방장 or user 확인 후 변수에 값 담기 + DB insert & select 
        chatRoom_user = (user_nickname.length <= 0) ? chatRoom_nickname : user_nickname;
        await Chat_user.create({ chatRoom_name, chatRoom_user, user_socketID })
        let chat_users = await Chat_user.findAll({
            attributes: ['chatRoom_name', 'chatRoom_user', 'user_socketID'],
            where: { chatRoom_name, }
        });

        // 처음 방 개설 or join 시 해당 user에게 환영인사 
        if (user_nickname.length <= 0) {
            socket.emit('system', {
                msg: `${chatRoom_user}방장님 환영합니다 !`,
                chat_users,
            })
        } else {
            socket.emit('system', {
                msg: `${user_nickname}님 채팅방에 오신 것을 환영합니다 !`,
                chat_users,
            })
        }

        // 누군가 join 시 같은 room 안의 users에게 보내기 
        socket.in(room).emit('system', {
            msg: `${user_nickname}님이 접속하셨습니다.`,
            chat_users,
        });
    })


    // 메세지 받아 재전송 (해당 room 에게 보내기) 방장 - 1 / users - 0 
    socket.on('message', (data) => {
        let { msg, room, user_nickname, chatRoom_nickname, user_socketID } = data;

        // blacklist 메세지 안보내지게 만들기 
        if (blacklist.length <= 0) {
            if (user_nickname.length <= 0) {
                socket.in(room).emit('messageBack', {
                    msg, room, 'user': chatRoom_nickname, 'bj': 1,
                });
            } else {
                socket.in(room).emit('messageBack', {
                    msg, room, 'user': user_nickname, 'bj': 0,
                });
            }
        } else {
            blacklist.forEach(v => {
                console.log(blacklist, v, user_socketID)
                if (v == user_socketID) {
                    // blacked된 본인에게 보내기 
                    // EventEmitter.prototype.emit.call( "black_alert", user_nickname);
                    socket.emit('black_alert', user_nickname)
                } else {
                    if (user_nickname.length <= 0) {
                        socket.in(room).emit('messageBack', {
                            msg, room, 'user': chatRoom_nickname, 'bj': 1,
                        });
                    } else {
                        socket.in(room).emit('messageBack', {
                            msg, room, 'user': user_nickname, 'bj': 0,
                        });
                    }
                }
            });
        }
    })

    // 대화 차단된 user 받아 list에 저장
    socket.on('block_this_user', (data) => {
        let { user_socketID, chatRoom_name } = data;
        blacklist.push(user_socketID);
        console.log('** blacklist & chatRoomName=', blacklist, chatRoom_name)
        socket.in(chatRoom_name).emit('blacklist', blacklist)
    })


    // user 나가기 -> disconnect - socket연결 끊어짐 
    socket.on('disconnect', async () => {
        let user_socketID = socket.id;
        let user_nickname;
        let find_chatroom = await Chat_user.findOne({
            attributes: ['chatRoom_user', 'chatRoom_name',],
            where: { user_socketID, }
        });
        let chatRoom_name = find_chatroom.dataValues.chatRoom_name;
        user_nickname = find_chatroom.dataValues.chatRoom_user;
        let bangjang_socket = await Chat_user.findAll({ where: { chatRoom_name, } });

        // 채팅방 나갔을 때 DB에서 삭제
        await Chat_user.destroy({ where: { chatRoom_name, user_socketID, } });
        console.log(`user disconnected (socket.id==${user_socketID})`)

        // 같은 채팅방 사용자들에게 탈퇴한 user 안내, 현재 채팅 중인 users list 보내기
        let chat_users = await Chat_user.findAll({ where: { chatRoom_name, } });
        socket.in(chatRoom_name).emit('system', {
            msg: `${user_nickname}님이 채팅방을 나가셨습니다.`,
            chat_users,
        });

        // 채팅방 인원 0명일 때 DB에서 해당 채팅방 삭제 
        if (chat_users.length <= 0) {
            await Chat.destroy({ where: { chatRoom_name } })
        } else {
            // 방장이 채팅방을 나간 경우 - 다음 user가 새로운 방장 update 
            if(chat_users[0].dataValues.user_socketID!=bangjang_socket[0].dataValues.user_socketID){
                let new_bangjang = chat_users[0].dataValues.chatRoom_user;
                await Chat.update({ chatRoom_nickname: new_bangjang, }, { where: { chatRoom_name }});
                socket.in(chatRoom_name).emit('system', {
                    msg: `${new_bangjang}님이 새로운 방장이 되셨습니다.`,
                    chat_users, new_bangjang,
                });
            }
        }
    })
})

server.listen(port, () => {
    console.log(`server start port : ${port}`)
})


