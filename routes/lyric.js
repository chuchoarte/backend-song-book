const {Router} = require('express');
const router = Router();
const axios = require('axios');
const {API_KEY} = process.env;
const Similarity = require('../helpers/Similarity')
const ExtractLyrics = require('../helpers/ExtractLyric')

router.get('/artist/:artist/title/:title', async (req, res) => {

    const {artist, title} = req.params;
    const q = `${title}+'+by+'+${artist}`;
    const response = await axios.get('https://api.genius.com/search?access_token='+API_KEY+'&q='+q);
    const data = response.data.response.hits[0];

    if (Similarity(data.result.full_title, q) > 0.55) {
        const url = 'https://api.genius.com/songs/';
        const headers = {
            'Authorization': 'Bearer ' + API_KEY
        };
        let {
            data: { response: { song } }
        } = await axios.get(url + data.result.id, { headers });
        req.params.lyrics = await ExtractLyrics(song.url);
    }
    res.json({
        ok: true,
        'lyrics': req.params.lyrics,
    });
});


module.exports = router;