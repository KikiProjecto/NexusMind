import express from 'express';

const app = express();
app.use(express.json());

app.post('/message', (req, res) => {
  console.log("[Relayer] Received message:", req.body);
  res.status(200).json({ status: "OK", archivedToWalrus: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock Relayer listening on port ${PORT}`);
});
