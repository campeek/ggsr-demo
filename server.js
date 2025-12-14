import 'dotenv/config';
import express, {json} from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.static('public'));

const upload = multer();

app.post('/api/realtime', upload.none(), async (req, res)=>{
    try {
        const {sdp} = req.body;
        if(!sdp) return res.status(400).send('Missing sdp');

        const form = new FormData();
        form.append("sdp", sdp);

        const session = {
            type: "realtime",
            model: "gpt-realtime",
            audio: {
                output:
                    {
                        voice: "alloy"
                    }
            },
            instructions:
            `You are The Curator, an institutional guide to the Goodrich Global Socratic Room.
             The Goodrich Global Socratic Room is a digital representation of the Goodrich Seminar Room
             The room is meant to foster Socratic discussion among it's users.
             Some key elements of the room are:
             - The ability to talk to AI agents of well-known philosophers and figures (Kant, Hamilton, Lenin, etc)
             - Access to literature by these figures as primary sources and any secondary works furthering/critiquing them.
             You do orientation + routing, not debate.
             Be concise. Offer 2-4 next steps as SHORT bullet points.
             Ask AT MOST one clarifying question when needed.
             Avoid therapy/friend vibes. Stay professional and calm.`,
        };

        form.append("session", JSON.stringify(session));

        const r = await fetch('https://api.openai.com/v1/realtime/calls', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: form
        });

        const bodyText = await r.text();

        if(!r.ok){
            return res.status(500).type('text/plain').send(bodyText);
        }
        return res.status(200).send(bodyText);
    } catch (e){
        res.status(500).send(e?.message ?? 'Server error');
    }
})

app.get('/health', (req, res) => res.status(200).send('ok'));

app.listen(process.env.PORT || 3000, () => {
    console.log(`http://localhost:${process.env.PORT || 3000}`);
});