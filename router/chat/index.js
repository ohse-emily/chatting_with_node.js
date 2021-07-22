const express=require('express');
const router = express.Router();
const controller = require('./chat.controller')

router.get('/', controller.chat);
router.get('/openChatRoom', controller.openChatRoom);
router.post('/openChatInfo', controller.openChatInfo);
router.post('/', controller.chat);
router.get('/user_goto_chatroom',controller.user_goto_chatroom);
router.get('/user_write_id', controller.user_write_id);
router.post('/user_goto_chatroom_by_post', controller.user_goto_chatroom_by_post);
router.get('/chatRoom_pw_check', controller.chatRoom_pw_check);

module.exports = router;