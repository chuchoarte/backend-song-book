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

    const getLyrics = await Promise.all(response.data.response.hits.map(async item => {
        if (Similarity(item.result.full_title, q) > 0.55) {
            const url = 'https://api.genius.com/songs/';
            const headers = {
                'Authorization': 'Bearer ' + API_KEY
            };
            let {
                data: { response: { song } }
            } = await axios.get(url + item.result.id, { headers });
            return await ExtractLyrics(song.url);
        }
    }));

    let getLyricFiltered = getLyrics.filter(item => {
        return item !== undefined;
    });

    const lyrics = getLyricFiltered[0];

    res.json({
        ok: true,
        'full_title': data.result.full_title,
        'lyrics': lyrics,
    });
});


module.exports = router;