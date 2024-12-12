import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const apiKey = "153cd180";

const average = arr =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const { movies, isLoading, error } = useMovies(query);
    const [watched, setWatched] = useLocalStorageState([], "watched");

    function handelSelectedMovie(id) {
        setSelectedId(selectedId => (selectedId === id ? null : id));
    }

    function handelCloseMovie() {
        setSelectedId(null);
    }

    function handelAddWatched(movie) {
        setWatched(watched => [...watched, movie]);
        // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    }

    function handelDeleteWatched(id) {
        setWatched(watched => watched.filter(movie => movie.imdbId !== id));
    }

    return (
        <>
            <NavBar>
                <Search query={query} setQuery={setQuery} />
                <NumResult movies={movies} />
            </NavBar>
            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <MoviesList
                            movies={movies}
                            OnSelectMovie={handelSelectedMovie}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>
                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            onCloseMovie={handelCloseMovie}
                            onAddWatch={handelAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <Summary watched={watched} />
                            <WatchedList
                                watched={watched}
                                onDeleteMovie={handelDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
    return (
        <p className="error">
            <span>⛔️</span> {message}
        </p>
    );
}

function ShowButton({ isOpen, setIsOpen }) {
    return (
        <button className="btn-toggle" onClick={() => setIsOpen(open => !open)}>
            {isOpen ? "–" : "+"}
        </button>
    );
}

function Main({ children }) {
    return (
        <>
            <main className="main">{children}</main>
        </>
    );
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="box">
            <ShowButton isOpen={isOpen} setIsOpen={setIsOpen} />
            {isOpen && children}
        </div>
    );
}

function MoviesList({ movies, OnSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map(movie => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    OnSelectMovie={OnSelectMovie}
                />
            ))}
        </ul>
    );
}

function Movie({ movie, OnSelectMovie }) {
    return (
        <li onClick={() => OnSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function Summary({ watched }) {
    const avgImdbRating = average(
        watched.map(movie => movie.imdbRating)
    ).toFixed(1);
    const avgUserRating = average(watched.map(movie => movie.userRating));
    const avgRuntime = average(watched.map(movie => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched?.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedList({ watched, onDeleteMovie }) {
    return (
        <ul className="list">
            {watched.map(movie => (
                <WatchedMovie
                    movie={movie}
                    key={movie.imdbId}
                    onDeleteMovie={onDeleteMovie}
                />
            ))}
        </ul>
    );
}

function WatchedMovie({ movie, onDeleteMovie }) {
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
                <button
                    className="btn-delete"
                    onClick={() => onDeleteMovie(movie.imdbId)}>
                    X
                </button>
            </div>
        </li>
    );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
    const [movie, setMovie] = useState({});
    const [userRating, setUserRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const isWatched = watched.map(movie => movie.imdbId).includes(selectedId);
    const watchedUserRating = watched.find(
        movie => movie.imdbId === selectedId
    )?.userRating;

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    useKey("Escape", onCloseMovie);
    useEffect(
        function () {
            async function getMovieDetails() {
                setIsLoading(true);
                const res = await fetch(
                    `http://www.omdbapi.com/?apikey=${apiKey}&i=${selectedId}`
                );
                const data = await res.json();
                setMovie(data);
                setIsLoading(false);
            }
            getMovieDetails();
        },
        [selectedId]
    );
    useEffect(
        function () {
            if (!title) return;
            document.title = `Movie | ${title}`;
            return function () {
                document.title = "usePopcorn";
            };
        },
        [title]
    );
    function handelAdd() {
        const WatchedMovie = {
            imdbId: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(" ").at(0)),
            userRating,
        };
        onAddWatch(WatchedMovie);
        onCloseMovie();
    }
    return (
        <div className="details">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    {" "}
                    <header>
                        <button className="btn-back" onClick={onCloseMovie}>
                            &larr;
                        </button>
                        <img src={poster} alt={`Poster of ${movie} movie`} />
                        <div className="details-overview">
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐️</span>
                                {imdbRating} IMDb rating
                            </p>
                        </div>
                    </header>
                    <section>
                        <div className="rating">
                            {isWatched ? (
                                <p>
                                    You are rated this movie{" "}
                                    <strong>{watchedUserRating}</strong>{" "}
                                    <span>⭐️</span>
                                </p>
                            ) : (
                                <>
                                    <StarRating
                                        maxRating={10}
                                        size={24}
                                        onSetRating={setUserRating}
                                        key={selectedId}
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className="btn-add"
                                            onClick={handelAdd}>
                                            + Add to list
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
        </div>
    );
}

function NavBar({ children }) {
    return (
        <nav className="nav-bar">
            <Logo />
            {children}
        </nav>
    );
}

function Search({ query, setQuery }) {
    const inputEl = useRef(null);
    useKey("Enter", function () {
        if (document.activeElement === inputEl.current) return;
        inputEl.current.focus();
        setQuery("");
    });
    // useEffect(
    //     function () {
    //         function callback() {
    //             if (document.activeElement === inputEl.current) return;
    //             inputEl.current.focus();
    //             setQuery("");
    //         }

    //         document.addEventListener("keypress", callback);
    //         return function () {
    //             document.removeEventListener("keypress", callback);
    //         };
    //     },
    //     [setQuery]
    // );

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function NumResult({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies?.length}</strong> results
        </p>
    );
}
