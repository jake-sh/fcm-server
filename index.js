const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// Firebase Admin 초기화
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch(e) {
  console.error('Service account parse error:', e.message);
}

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// 헬스체크
app.get('/', (req, res) => res.json({ status: 'ok' }));

// FCM 푸시 전송
app.post('/send', async (req, res) => {
  const { token, title, body } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  try {
    await admin.messaging().send({
      token,
      notification: { title: title || '📅 일정 알림', body: body || '새 일정이 있어요' },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } }
    });
    res.json({ success: true });
  } catch(e) {
    console.error('FCM error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FCM server running on port ${PORT}`));
