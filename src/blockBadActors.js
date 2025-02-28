/*
  Block from a list of known bad actors
  by: diskrot

  This will create a key within local storage called 'diskrot:ban' which will
  allow the script to recover from session expiration. You will need to refresh
  the browser and run this script multiple times.
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

/*
//
    {
        'display_name': '',
        'id': ''
    },
    */

const badActors = [
    {
        'display_name': 'marciocampos',
        'id': 'https://suno.com/song/57b44b65-4419-4221-9e52-6bd312e3c58b'
    },
    {
        'display_name': '3daizy',
        'id': 'https://suno.com/song/423d3dea-7a36-4621-a3b2-ff92edc066d4'
    },
    {
        'display_name': 'lucilius',
        'id': 'https://suno.com/song/3c27cceb-5b71-4e6c-9e09-71341b4926d3'
    },
    //
    {
        'display_name': 'Sawchang',
        'id': 'https://suno.com/song/550a9a5a-3f6c-4938-9936-2db4af736c2b'
    },
    //
    {
        'display_name': 'The Fool',
        'id': 'https://suno.com/song/095fef37-5a2e-4b65-8c95-a84b9ac8d8e4'
    },
    //
    {
        'display_name': 'LemonRain',
        'id': 'https://suno.com/song/f4b93a37-b227-43d4-8987-2de00c7dfd46'
    },
    //
    {
        'display_name': 'nyx',
        'id': 'https://suno.com/song/a0dbd850-4e08-4671-ada7-344febe3da10'
    },
    //
    {
        'display_name': '🐾💜Sesi💜🐾',
        'id': 'https://suno.com/song/ae106b91-64a6-4e25-8235-a72c26dcdd06'
    },
    //
    {
        'display_name': 'abelwolfsuno84',
        'id': 'https://suno.com/song/511c8af1-b6fc-4cf0-b5fb-97549537af5d'
    },//
    {
        'display_name': 'EvilTyromancer',
        'id': 'https://suno.com/song/07d7a477-e06c-4f33-800c-5a7a962efc1c'
    },
    //
    {
        'display_name': '二月February',
        'id': 'https://suno.com/song/15b9492a-37bc-45bf-8aa0-3c8b4239c196'
    },
    //
    {
        'display_name': 'Thiago VS',
        'id': 'https://suno.com/song/24b4517c-4688-4d23-aeaf-9bbd71c8fe14'
    },
    //
    {
        'display_name': 'Darko',
        'id': 'https://suno.com/song/9fee4573-f55a-4580-b4b2-df1abb6fad03'
    },
    //
    {
        'display_name': 'STEZIOUS',
        'id': 'https://suno.com/song/c8282c5f-5929-423d-b12f-d50f749dc001'
    },
    //
    {
        'display_name': 'LemonRain',
        'id': 'https://suno.com/song/f4b93a37-b227-43d4-8987-2de00c7dfd46'
    },
    //
    {
        'display_name': 'E/V 🦇 ǝɹı̣dɯɐꓥ ɔı̣uoɹʇɔǝןƎ 🦇',
        'id': 'https://suno.com/song/9e9e258e-a8e0-4561-8a20-9c8f8df307e1'
    },
    //
    {
        'display_name': 'Brado with the face for radio',
        'id': 'https://suno.com/song/167020f4-2acd-4d6e-b4f3-77c8d4feab50'
    },
    //
    {
        'display_name': 'heymow',
        'id': 'https://suno.com/song/cd5313ec-73f7-4fc8-a9ae-80f407f9c0cb'
    },
    //
    {
        'display_name': 'Alex Kruk ♫',
        'id': 'https://suno.com/song/01e48035-4379-49d7-a9fc-f577d181a686'
    },
    //
    {
        'display_name': 'RΛCHΞY',
        'id': 'https://suno.com/song/30027a2f-ce59-41e1-bb1f-8ad38a91f27d'
    },
    //
    {
        'display_name': 'Hotpot of Genres',
        'id': 'https://suno.com/song/39fadf79-a101-4e13-b1db-9831c0f18f72'
    },
    //
    {
        'display_name': 'AriteAL',
        'id': 'https://suno.com/song/e2b4c3b2-0486-4baf-9d45-0991173bdbcf'
    },
    //
    {
        'display_name': '♩♪♫ Ziksa 🔥',
        'id': 'https://suno.com/song/7acbb809-a67b-497a-a005-e0e68d17c1a1'
    },
    //
    {
        'display_name': 'Vin Mos',
        'id': 'https://suno.com/song/098b944d-1f47-4996-8b64-5c76a3e4a252'
    },
    //
    {
        'display_name': 'AurasVseillya',
        'id': 'https://suno.com/song/6fcf4cad-4d08-456b-bc3e-a2f7523f3b29'
    },
    //
    {
        'display_name': 'Brandon Luke',
        'id': 'https://suno.com/song/34ca8e1d-1eb1-4ca4-960d-82528343d69e'
    },
    //
    {
        'display_name': 'JUSIME',
        'id': 'https://suno.com/song/e9c80530-66d8-4ab3-9f14-d8545df939e3'
    },
    //
    {
        'display_name': 'Foggy',
        'id': 'https://suno.com/song/d7db16d4-c657-4141-aa58-ffa2aa5b9977'
    },
    //
    {
        'display_name': 'hasenchat',
        'id': 'https://suno.com/song/3ba86dae-1352-4639-b901-1b6194e7290d'
    },
    //
    {
        'display_name': 'mrbabo',
        'id': 'https://suno.com/song/2cb95326-e0ef-475a-a616-565e7cb28cff'
    },
    //
    {
        'display_name': 'sounami',
        'id': 'https://suno.com/song/3fa1c84b-9115-4a50-9a86-e013a6b0a198'
    },
    //
    {
        'display_name': 'bojian',
        'id': 'https://suno.com/song/39cdfc9d-f718-4658-8f04-03aa34cf979b'
    },
    //
    {
        'display_name': 'brutus',
        'id': 'https://suno.com/song/04440f12-078f-434c-837e-4fac9990713d'
    },
    //
    {
        'display_name': 'mr_villain',
        'id': 'https://suno.com/song/42d2d129-aceb-49c3-aa41-a0c38a1fdf36'
    },
    //
    {
        'display_name': 'kevinspiration',
        'id': 'https://suno.com/song/b6dd957b-6f06-4a00-b0d8-52f2b6675dbb'
    },
    //
    {
        'display_name': 'chibiitaii',
        'id': 'https://suno.com/song/0e1a1313-f1d4-4848-9d74-19749ed14388'
    },
    //
    {
        'display_name': 'renhal',
        'id': 'https://suno.com/song/97e81b31-c3d7-416f-8833-ed4fa1e1aa77'
    },
    //
    {
        'display_name': 'adek',
        'id': 'https://suno.com/song/1783c864-18fb-440f-bc51-15701a19e4b5'
    },
    //
    {
        'display_name': 'teemuth',
        'id': 'https://suno.com/song/48b753f2-a4ca-480a-b069-79e8be95f63a'
    },
    //
    {
        'display_name': 'oyojee',
        'id': 'https://suno.com/song/7fcbc22d-fb68-48f2-a6b8-39cdfde3dc9f'
    },
    //
    {
        'display_name': 'haiahdigital',
        'id': 'https://suno.com/song/337d7be2-52f0-49d5-9965-b1b3fe8e974c'
    },
    //
    {
        'display_name': 'tongmick',
        'id': 'https://suno.com/song/7de6a8f0-c15d-4be9-93ee-3fae45d8d72b'
    },
    //
    {
        'display_name': 'ΛMΞX',
        'id': 'https://suno.com/song/aa0af6c3-050a-414e-9439-a4934d003b44'
    },
    //
    {
        'display_name': 'aimagician',
        'id': 'https://suno.com/song/1f42943e-bcd5-4289-990a-5395cecc68c2'
    },
    //
    {
        'display_name': 'mysteriousvocoder470',
        'id': 'https://suno.com/song/80ed7707-4e31-4f36-aa18-c8b2321313a1'
    },
    //
    {
        'display_name': 'frowns',
        'id': 'https://suno.com/song/e87e68b3-d834-4b07-b3d6-1f1134a97077'
    },
    //
    {
        'display_name': 'techneticdreams',
        'id': 'https://suno.com/song/781df0a0-4d0e-4e35-ab6b-fb1e689203e5'
    },
    //
    {
        'display_name': 'killeen',
        'id': 'https://suno.com/song/466dcddf-68ec-4ccd-963f-fc2dc5d44d6c'
    },
    //
    {
        'display_name': 'Wine loves flowers',
        'id': 'https://suno.com/song/682349a7-fc02-46f1-8fbd-aed67dee2c6e'
    },
    //
    {
        'display_name': 'timotheus',
        'id': 'https://suno.com/song/b9ba997d-6ae4-4adf-9acf-58682adc0a32'
    },
    //
    {
        'display_name': 'the_jestermc',
        'id': 'https://suno.com/song/6b8f75f6-1deb-43b2-b2ba-2074fcdeb7d4'
    },
    //
    {
        'display_name': 'eclonix',
        'id': 'https://suno.com/song/67ae685b-980b-4b2a-a25f-f24762b53c25'
    },
    //
    {
        'display_name': 'alitunes',
        'id': 'https://suno.com/song/198e9e55-5aba-42e1-b8c4-431be7db395f'
    },
    //
    {
        'display_name': 'MASTA - STUDIOS',
        'id': 'https://suno.com/song/4cd61ec2-5ec0-4515-a34a-6b7166eeeca0'
    },
    //
    {
        'display_name': 'Stovo Lando',
        'id': 'https://suno.com/song/15e7f445-7571-4921-bb65-77916b22cd6b'
    },
    //
    {
        'display_name': 'MAXIMUM',
        'id': 'https://suno.com/song/a65589ae-d94f-4204-93f2-9370ca2d0aef'
    },
    //
    {
        'display_name': 'Raven',
        'id': 'https://suno.com/song/4d4003cf-6801-4cf4-825d-b442446c664b'
    },
    //
    {
        'display_name': 'Artcanum',
        'id': 'https://suno.com/song/c0ab0eb4-51d5-4aef-9f23-2a35f42e8e0a'
    },
    //
    {
        'display_name': 'cumalot',
        'id': 'https://suno.com/song/2ef81588-860d-4d2a-b878-05da10600d02'
    },
    //
    {
        'display_name': 'ComaToastedFX',
        'id': 'https://suno.com/song/4799c28f-2952-4fc0-a166-396f20c0f2f4'
    },
    //
    {
        'display_name': 'Alex Curly',
        'id': 'https://suno.com/song/cb424ed8-7859-4ceb-9976-fd4ac124bc39'
    },
    //
    {
        'display_name': 'LarryP',
        'id': 'https://suno.com/song/23979d8a-2a8b-4e13-91cc-b51b95695606'
    },
    //
    {
        'display_name': 'engineertiger',
        'id': 'https://suno.com/song/4422ffb9-bd9a-4499-b3aa-429f8f9359fd'
    },
    //
    {
        'display_name': 'nanashi_zero',
        'id': 'https://suno.com/song/ffa48fbf-ac87-4a02-8cf2-f3766f518d58'
    },
    //
    {
        'display_name': 'sounditaly',
        'id': 'https://suno.com/song/5c838d2d-94d8-4529-8d26-3336ad3e5c88'
    },
    //
    {
        'display_name': 'mairtin',
        'id': 'https://suno.com/song/686604f9-2a03-4a8b-8b43-8b80f6c450a8'
    },
    //
    {
        'display_name': 'madok958',
        'id': 'https://suno.com/song/9aa59567-8c6a-4af3-9462-6d5fcc425816'
    },
    //
    {
        'display_name': 'notvizion',
        'id': 'https://suno.com/song/c4090809-541d-4ee5-bc1f-040eb53b2853'
    },
    //
    {
        'display_name': 'lucky_nobody',
        'id': 'https://suno.com/song/981e6b3e-3de4-4a45-860c-558f1712e853'
    },
    //
    {
        'display_name': 'crispity',
        'id': 'https://suno.com/song/1b28f52a-0311-48e1-a645-f06f6a6f3d66'
    },
    //
    {
        'display_name': 'wrecks',
        'id': 'https://suno.com/song/1c75a5dd-09b7-4572-b17d-1f107a32f9ec'
    },
    //
    {
        'display_name': 'panz',
        'id': 'https://suno.com/song/7563cdb3-09e5-497d-a1d5-485e51021c6a'
    },
    //
    {
        'display_name': 't-anna',
        'id': 'https://suno.com/song/0ba979a6-fd20-46a6-bcca-ab4821c7fc7b'
    },
    //
    {
        'display_name': 'xᴇɴᴏx',
        'id': 'https://suno.com/song/9d008a6d-e2dc-4230-88e7-4a62a19d4c21'
    },
    //
    {
        'display_name': 'zeroes',
        'id': 'https://suno.com/song/a717baab-8aaa-4937-80b8-38966e58274a'
    },
    //
    {
        'display_name': 'zaron',
        'id': 'https://suno.com/song/00640603-11a6-4bce-bca3-c303350ff181'
    },
    //
    {
        'display_name': 'electrichood',
        'id': 'https://suno.com/song/e0a360fa-466b-43c4-84a4-d42b325ebe6b'
    },
    //
    {
        'display_name': 'iamhumain',
        'id': 'https://suno.com/song/0b3c7078-4349-4b94-82ab-7f62137e6073'
    },
    //
    {
        'display_name': 'Synthlogue 🎹🎶',
        'id': 'https://suno.com/song/f08a7032-ebf7-4961-a44c-1a00bc9ca396'
    },
    //
    {
        'display_name': 'rayanair',
        'id': 'https://suno.com/song/1dfd1a6b-311a-41c5-adb9-e638348446a4'
    },
    //
    {
        'display_name': 'sarahoshinovt',
        'id': 'https://suno.com/song/3c9b8811-f631-452e-bfde-d5a7cdfc49f4'
    },
    //
    {
        'display_name': 'Coft',
        'id': 'https://suno.com/song/23bb8ae5-cb33-4a16-9d20-216086da223b'
    },

    {
        'display_name': 'S+T',
        'id': 'https://suno.com/song/4d731895-096d-432e-aae9-404f1363220a'
    },

    {
        'display_name': 'randopengu',
        'id': 'https://suno.com/song/5d019050-a20a-4a1d-b071-2086bd925b2a'
    },

    {
        'display_name': 'alternativerealityradio',
        'id': 'https://suno.com/song/0dc2166b-7d3b-468a-88f9-adc0fee3ae4a'
    },

    {
        'display_name': 'pseunonymous',
        'id': 'https://suno.com/song/0468e58c-abbe-431e-9f04-4f0b00c9c353'
    },
    {
        'display_name': 'blackkatt',
        'id': 'https://suno.com/song/34de5eab-123d-4592-b064-61633fb36df5'
    },
    {
        'display_name': 'blackkatt_judge_dredd',
        'id': ''
    },
    {
        'display_name': 'blackkatt_mc',
        'id': ''
    },
    {
        'display_name': 'blackkatt_sverige',
        'id': ''
    },
    {
        'display_name': 'blackkatt_mobile',
        'id': ''
    },
    {
        'display_name': 'ask_blackkatt',
        'id': 'https://suno.com/song/12791a29-be66-4ef7-a16e-44d5fff9a297'
    }
];


// Block anyone in blocklist
async function applyBlockList() {
    let bearerToken = getCookieValue('__session');

    if (!bearerToken) {
        console.error("Bearer token not found. Please log in.");
        return null;
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let banCounter = localStorage.getItem('diskrot:banCounter');

    if (banCounter == null) {
        localStorage.setItem('diskrot:banCounter', 0);
        banCounter = 0;
        console.log(`first run setting counter to ${banCounter}`);
    } else {
        console.log(`restarting counter from ${banCounter}`);
    }

    for (let i = banCounter; i < badActors.length; i++) {
        let song = badActors[i];
        let songTokens = song['id'].split('/');
        let songId = songTokens[songTokens.length - 1];


        const blockReponse = await fetch(`${sunoAPI}/recommend/feedback/song/${songId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "feedback_type": "creator_not_interested"
            })
        });

        if (blockReponse.status == 401 || blockReponse.status == 429) {
            throw Error('Token expired');
        }

        console.log(`Blocking ${song['display_name']}`);

        localStorage.setItem('diskrot:banCounter', i);
        await delay(1000); // Add delay to avoid overwhelming the API
    }
}

// Find Bearer token
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

(async () => {

    try {
        await applyBlockList();
        console.log('Complete. You do not need continue running the script.');
    } catch (e) {
        console.log("Refresh your browser and rerun until you see \'Complete\'");
    }
})();
