const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('기기 연결됨:', socket.id);

    // PC 대화면 브라우저가 방을 생성할 때
    socket.on('create-room', () => {
        const roomId = Math.floor(100000 + Math.random() * 900000).toString(); 
        socket.join(roomId);
        socket.emit('room-created', roomId);
    });

    // 안드로이드 앱이 방 번호를 입력하고 조인할 때
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('remote-connected');
    });

    // 안드로이드 앱 -> PC 브라우저: "내 화면 영상 Offer 신호 보낸다!"
    socket.on('webrtc-offer', (data) => {
        socket.to(data.roomId).emit('webrtc-offer', data);
    });

    // PC 브라우저 -> 안드로이드 앱: "연결 수락(Answer) 신호 보낸다!"
    socket.on('webrtc-answer', (data) => {
        socket.to(data.roomId).emit('webrtc-answer', data);
    });

    // 실시간 회선 연결을 위한 주소 교환 (ICE Candidate) 중계
    socket.on('webrtc-candidate', (data) => {
        socket.to(data.roomId).emit('webrtc-candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('기기 연결 해제됨:', socket.id);
    });
});

const listener = http.listen(process.env.PORT || 3000, () => {
    console.log('미러링 중계 서버 가동 중. 포트: ' + listener.address().port);
});