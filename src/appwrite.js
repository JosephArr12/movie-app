import { Client, Databases , ID, Query} from "appwrite";
//Import the environment variables to use them
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
//Accessing the database
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID)

const database = new Databases(client);

//Updating the search count runs after every search
export const updateSearchCount = async (searchTerm, movie) =>{
        //1.Use appwrite sdk to check if search term exists
    try{
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);
        //2 if it does, update the count in database
        if(result.documents.length>0){
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id,{
                count: doc.count+1,
            })
        
        }
           //3 If not, create a new document with search term and count set to 1
        else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(),{
                searchTerm,
                count:1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    }catch(error){
        console.error(error);
    }

    
 
}

//Access the trending movies by selecting the 5 movies with the highest count in the database
export const getTrendingMovies = async()=>{
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents;
    } catch(error){

    }
}
