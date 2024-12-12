import { useState, useEffect } from "react";

export function useLocalStorageState(initialVal, key) {
    const [value, setValue] = useState(function () {
        const storedMovies = localStorage.getItem(key);
        return storedMovies ? JSON.parse(storedMovies) : initialVal;
    });

    useEffect(
        function () {
            localStorage.setItem(key, JSON.stringify(value));
        },
        [value, key]
    );
    return [value, setValue];
}
