import React from 'react'
import { useState, useEffect } from 'react'
import Search from './components/search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'
const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS ={
  method:'GET',
  headers:{
    accept: 'application/json',
    Authorization:`Bearer ${API_KEY}`
  }
}


const App = () => {

  //All the states for the app
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  //Debound the search term to prevent users making too many API requests
  //Waits for the user to stop typing for 1000ms
  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 1000, [searchTerm])

  //Fetches the movies from the TMDB API
  const fetchMovies = async(query = '')=>{
    setIsLoading(true);
    setErrorMessage('');
    try{
      //The search is for the most popular movies
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint,API_OPTIONS);
      if(!response.ok){
        throw new Error("Failed to fetch movies");
      }
      //Assign the data
      const data = await response.json();
      if(data.Response === 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([])
        return;
      }
      console.log(data);
      //Updating the movie list state
      setMovieList(data.results || []);
      if(query && data.results.length>0){
        //update the database
        await updateSearchCount(query, data.results[0]);
      }
    }
    catch(error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally{
      setIsLoading(false);
    }
  }

  //loading the trending movies, this only happens when page first loads
  const loadTrendingMovies = async ()=>{
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    }catch(error){
      console.error(`Error fetching trending movies: ${error}`);

    }
  }

  //update the page when the user searches
  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])
  
  //Load the trending movies on page load
  useEffect(()=>{
    loadTrendingMovies();
  },[])


  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src = "./hero.png" alt ="Hero Banner"/>
          <h1>Find <span class='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        
{trendingMovies.length >0 &&(
  <section className='trending'>
<ul>
{trendingMovies.map((movie,index)=>(
  <li key ={movie.$id}>
    <p>{index + 1}</p>
    <img src ={movie.poster_url} alt={movie.title}/>
  </li>
))

}
</ul>
  </section>
)}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ?(
            <Spinner/>

          ): errorMessage ?(<p className='text-red-500'>{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie)=>(
                <MovieCard key ={movie.id} movie ={movie} />
              ))}
            </ul>
          )
          }
          {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
        </section>
      </div>
    </main>
  )
}

export default App