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

    await Promise.all(response.data.response.hits.map(async item => {
        if (Similarity(item.result.full_title, q) > 0.65) {
            const url = 'https://api.genius.com/songs/';
            const headers = {
                'Authorization': 'Bearer ' + API_KEY
            };
            let {
                data: { response: { song } }
            } = await axios.get(url + item.result.id, { headers });
            req.params.full_title = item.result.full_title;
            req.params.liric = await ExtractLyrics(song.url);
        }
    }));

    res.json({
        ok: true,
        'full_title': req.params.full_title,
        'lyrics': req.params.liric,
    });
});


module.exports = router;