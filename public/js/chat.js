// 채팅방 입장 
let user_nickname = document.querySelector('#user_nickname').innerHTML;
let chatRoom_name = document.querySelector('#chatRoom_name').innerHTML;
let chatRoom_nickname = document.querySelector('#chatRoom_nickname').innerHTML;
let chatRoom_users_list = document.querySelector('#chatRoom_users_list');
let chatRoom_place_box = document.querySelector('#chatRoom_place_box');
let blacklist;

//            chatting div 창 스크롤              //
chatRoom_place_box.scrollTop = chatRoom_place_box.scrollHeight;


// handshake요청 from 브라우저
const socket = io();
socket.on('connect', (id) => { });


//                chattingRoom.html JS                // 
//                      J O I N                       //
let room = chatRoom_name;
let joinData = { room, user_nickname, chatRoom_nickname }
socket.emit('join', joinData);


//                 W E L C O M I N G                  //
socket.on('system', (data) => {
    let div = document.createElement('div');
    let div_t = document.createElement('div');
    let span = document.createElement('span');
    let span_t = document.createElement('span');

    let T = new Date();
    let H = T.getHours();
    let M = ('00' + T.getMinutes()).slice(-2);
    let now = (H >= 12 && H <= 24) ? '오후' : '오전';
    H = H >= 12 ? H - 12 : H;
    H = ('00' + H).slice(-2);
    let clock = `${now} ${H}:${M}`

    span.innerHTML = data.msg;
    span_t.innerHTML = clock;
    div.appendChild(span);
    div_t.append(span_t);
    div.classList.add('entering');
    div_t.classList.add('entering');
    chatRoom_place_box.appendChild(div_t);
    chatRoom_place_box.appendChild(div);

    chatRoom_users_list.innerHTML = '';
    let chatRoom_name = data.chat_users[0].chatRoom_name;
    let bangjang = data.chat_users[0].user_socketID

    data.chat_users.forEach(v => {
        let div_user = document.createElement('div');
        div_user.classList.add('chatRoom_user_div');
        let p = document.createElement('p');
        p.innerHTML = v.chatRoom_user;
        p.classList.add('chatRoom_user_p')
        p.addEventListener('click', () => {
            user_click(div_user, v.user_socketID, bangjang, chatRoom_name);
        });

        let p_for_block = document.createElement('p');
        p_for_block.innerHTML = '차단';
        p_for_block.classList.add('p_for_block');
        div_user.appendChild(p);
        div_user.appendChild(p_for_block);
        chatRoom_users_list.appendChild(div_user);
    })

    if (data.new_bangjang != undefined) {
        let chatting_bangjang = document.querySelector('#chatting_bangjang');
        chatting_bangjang.innerHTML = `방장 : ${data.new_bangjang}`;
    }

})



//                B L A C K   L I S T                 //
// userlist의 user 클릭 시 '차단하기' 보이도록 only for 방장
function user_click(div, user_socketID, bangjang, chatRoom_name) {
     if (socket.id == bangjang && socket.id!=user_socketID) {
        let p = div.querySelector('.p_for_block');
        let d = div.querySelector('.display_block');
        if (d == undefined) {
            p.classList.add('display_block');
            p.addEventListener('click', () => {
                user_block_talking(user_socketID, chatRoom_name)
                p.classList.remove('display_block');
            });
        } else {
            p.classList.remove('display_block');
        }
    }
}

//   blacklist에 있는 user 대화 차단하기 
function user_block_talking(user_socketID, chatRoom_name) {
    let data = { user_socketID, chatRoom_name }
    socket.emit('block_this_user', data)
}

socket.on('blacklist', blacklist => {
    blacklist = blacklist;
})

//   차단된 user의 브라우저에 안내
socket.on('black_alert', user_nickname => {
    let div = document.createElement('div');
    let span = document.createElement('span');
    let span2 = document.createElement('span');
    let span3 = document.createElement('span');
    div.classList.add('block_div');
    span.classList.add('block_span');
    span2.classList.add('block_span');
    span3.classList.add('block_span', 'block_span3');
    span.innerHTML = `${user_nickname}님 죄송합니다.`;
    span2.innerHTML = `대화 차단이 되어 메세지 수신만 가능하시며`;
    span3.innerHTML = `${user_nickname}님의 메세지는 보내지지 않습니다.`;
    div.appendChild(span);
    div.appendChild(span2);
    div.appendChild(span3)
    chatRoom_place_box.appendChild(div);
})



//                     M E S S A G E                  //
// msg 보내기 
function send() {
    let user_socketID = socket.id;
    let msg = document.querySelector('#msg');
    if (msg.value == '') { return; }
    else {
        let data = { 'msg': msg.value, room, user_nickname, chatRoom_nickname, user_socketID }
        socket.emit('message', data);
        MEorYOU(msg.value, 'me')
        msg.value = '';
        chatRoom_place_box.scrollTop = chatRoom_place_box.scrollHeight;
    }
}


// msg 받기 from server
socket.on('messageBack', data => {
    console.log('브라우저 msg 받았습니다.', data.msg);
    MEorYOU(data.msg, 'you', data.user, data.bj)
})



// msg 누가 보냈는지 확인 + 방장 /user / me / you 에 다르게 채팅id추가
function MEorYOU(msg, who, user, bj) {
    const chatRoom_place_box = document.querySelector('#chatRoom_place_box');
    const div = document.createElement('div');
    const span = document.createElement('span');

    span.innerHTML = msg;
    span.classList.add(who);
    div.appendChild(span);
    let div_id = document.createElement('div');
    let span_id = document.createElement('span');

    if (who == 'you') {
        span_id.innerHTML = (bj == 1) ? `sent by ${user} (방장)` : `sent by ${user}`;
        div_id.classList.add('chatRoom_userID')
    } else {
        span_id.innerHTML = `sent by me`;
        div_id.classList.add('chatRoom_userID_me')
    }
    div_id.appendChild(span_id);
    chatRoom_place_box.appendChild(div_id);
    chatRoom_place_box.appendChild(div);
}

// sending by enter 
function enterSend() { if (event.keyCode == 13) { send() } }









