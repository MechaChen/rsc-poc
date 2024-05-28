import React, { Suspense } from 'react';

import Like from './Like.jsx';

export default function Page() {
    return (
        <>
            <h1 className='text-3xl mb-3'>Hello server component!</h1>
            <Suspense fallback="Fetching albums...">
                <Albums />
            </Suspense>
        </>
    );
}


const apiGetAlbums = () => {
    const response = {
        data: [
            {
                id: 1,
                title: 'FEARLESS',
                artists: 'Le Sserafim',
                cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Le_Sserafim_%E2%80%93_Fearless.png/220px-Le_Sserafim_%E2%80%93_Fearless.png',
                songs: [
                    { id: 11, title: 'The World Is My Oyster' },
                    { id: 12, title: 'FEARLESS' },
                    { id: 13, title: 'Blue Flame' },
                    { id: 14, title: 'The Great Mermaid' },
                    { id: 15, title: 'Sour Grapes' },
                ],
            },
            {
                id: 2,
                title: 'Bon Voyage',
                artists: 'Yooa',
                cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Bon_Voyage_-_YooA.png/220px-Bon_Voyage_-_YooA.png',
                songs: [
                    { id: 21, title: 'Bon voyage' },
                    { id: 21, title: 'Far' },
                    { id: 23, title: 'Diver' },
                    { id: 24, title: 'Abracadabra' },
                    { id: 25, title: 'End Of Story' },
                ],
            },
            {
                id: 3,
                title: 'HAPPENING',
                artists: 'AKMU',
                cover: 'https://lineimg.omusic.com.tw/img/album/3281272.jpg?v=20211004145718',
                songs: [
                    { id: 31, title: 'HAPPENING' },
                ],
            },
        ],
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(response);
        }, 3000);
    });
};

async function Albums() {
    const albums = await apiGetAlbums();

    return (
        <ul>
            {albums.data.map((album) => (
                <li key={album.id} className='flex gap-2 items-center mb-2'>
                    <img src={album.cover} alt={album.title} className="w-20 aspect-square" />
                    <div className='flex flex-wrap items-center'>
                        <h3 className='text-xl mr-3'>{album.title}</h3>
                        <p>{album.songs.length} songs</p>
                        <p className="w-full">Artist : {album.artists}</p>
                        <Like />
                    </div>
                </li>
            ))}
        </ul>
    );
}
