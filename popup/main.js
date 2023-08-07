// AssemblyAI API credentials
const API_TOKEN = '77ade9e331054d7f950481779a04a180';
const API_URL = 'https://api.assemblyai.com/v2';

// Voice search 
const voiceIcon = document.querySelector('.icon-spch');

voiceIcon.addEventListener('click', async () => {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.addEventListener('dataavailable', e => {
        chunks.push(e.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
        new Promise(resolve => {
            mediaRecorder.addEventListener('stop', () => {
                const blob = new Blob(chunks);
                resolve(blob);
            });
            mediaRecorder.stop();
        });

    start();

    setTimeout(async () => {

        const audioBlob = await stop();

        const data = new FormData();
        data.append('file', audioBlob);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                authorization: API_TOKEN
            },
            body: data
        });

        const { upload_url } = await response.json();

        const transcriptResponse = await fetch(`${API_URL}/transcript`, {
            method: 'POST',
            headers: {
                'authorization': API_TOKEN,
                'content-type': 'application/json'
            },
            body: JSON.stringify({ audio_url: upload_url })
        });

        const { id } = await transcriptResponse.json();

        const transcript = await getTranscript(id);

        searchInput.value += transcript;

        searchForm.submit();

    }, 5000);

});


const getTranscript = async (id) => {

    while (true) {
        const response = await fetch(`${API_URL}/transcript/${id}`);
        const { status } = await response.json();
        if (status === 'Completed') {
            return transcript;
        }
        await new Promise(r => setTimeout(r, 1000));
    }

};


// Image loading
const img = new Image();
img.src = "https://doodleipsum.com/300x300/outline";

img.onload = () => {
    document.getElementById("doodleImage").src = img.src;
    document.getElementById("body").style.display = "block";
};


// Search form
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#search-input");

searchForm.addEventListener("submit", e => {
    e.preventDefault();

    const query = searchInput.value;
    if (!query) return;

    const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
    window.location.href = url;
});