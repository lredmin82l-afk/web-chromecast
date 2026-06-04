const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// public 폴더 안의 HTML 파일들을 웹에 띄우도록 설정
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('기기 연결됨:', socket.id);

    // 1. PC가 접속해서 새로운 방 생성을 요청할 때
    socket.on('create-room', () => {
        // 6자리 무작위 방 번호 생성 (예: 582914)
        const roomId = Math.floor(100000 + Math.random() * 900000).toString(); 
        socket.join(roomId);
        socket.emit('room-created', roomId);
    });

    // 2. 모바일이 QR코드를 타고 방 번호를 들고 입장할 때
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        // 해당 방에 있는 PC에게 리모컨이 연결되었다고 신호 보냄
        socket.to(roomId).emit('remote-connected');
    });

    // 3. 모바일 리모컨이 제어 명령(PLAY/PAUSE)을 보낼 때
    socket.on('send-control', (data) => {
        // 같은 방에 있는 PC에게만 명령을 전달
        socket.to(data.roomId).emit('receive-control', data.action);
    });
});

// Render.com의 동적 포트를 수용하기 위한 설정 (중요)
const listener = http.listen(process.env.PORT || 3000, () => {
    console.log('서버가 정상 구동 중입니다. 포트: ' + listener.address().port);
});
