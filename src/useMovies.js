import { useState, useEffect } from "react";

const apiKey = "153cd180";

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(
        function () {
            const controller = new AbortController();
            async function fetchMovies() {
                try {
                    setIsLoading(true);
                    setError("");
                    const res = await fetch(
                        `http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`,
                        { signal: controller.signal }
                    );
                    if (!res.ok) throw new Error("Something went wrong");
                    const data = await res.json();
                    if (data.Response === "False")
                        throw new Error("Movie not found");
                    setMovies(data.Search);
                } catch (err) {
                    if (err.name !== "AbortError") {
                        console.error(err.message);
                        setError(err.message);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
            if (query.length < 3) {
                setMovies([]);
                setError("");
                return;
            }
            fetchMovies();
            return function () {
                controller.abort();
            };
        },
        [query]
    );
    return { movies, isLoading, error };
}