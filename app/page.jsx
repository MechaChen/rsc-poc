import React, { Suspense } from 'react';

export default function Page() {
    return (
        <>
            <h1>Hello server component!</h1>
            <Suspense fallback="Loading...">
                <Albums />
            </Suspense>
        </>
    );
}


const apiGetAlbums = async () => ({
    data: [
        {
            id: 1,
            title: 'Album 1',
            cover: 'https://via.placeholder.com/150',
            songs: [
                { id: 1, title: 'Song 1' },
                { id: 2, title: 'Song 2' },
            ],
        },
        {
            id: 2,
            title: 'Album 2',
            cover: 'https://via.placeholder.com/150',
            songs: [
                { id: 1, title: 'Song 1' },
                { id: 2, title: 'Song 2' },
            ],
        },
    ],
});

async function Albums() {
    const albums = await apiGetAlbums();

    return (
        <ul>
            {albums.data.map((album) => (
                <li key={album.id}>
                    <img src={album.cover} alt={album.title} />
                    <div>
                        <h3>{album.title}</h3>
                        <p>{album.songs.length} songs</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
