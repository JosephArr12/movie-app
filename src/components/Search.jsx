import React from 'react'

//This is the search box
const Search = ({searchTerm, setSearchTerm}) => {
    return (
    <div className='search'>
    <div>   
    <img src = "search.svg"/>
    <input
        type ="text"
        placeholder='Search through thousands of movies'
        value = {searchTerm}
        //Update the state of the search term which updates the list of movies to retrieve them from the API
        onChange={(e) => setSearchTerm(e.target.value)}
    />
    
    </div> 
    </div>
  )
}

export default Search