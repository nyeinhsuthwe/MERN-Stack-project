import { useState, useEffect } from "react";
import Ingredients from "../Components/Ingredients"
import plus from '../assets/plus.svg';
import axios from '../helpers/axios';
import {useNavigate, useParams} from 'react-router-dom'

export default function RecipeForm() {
    let { id } = useParams();
    let [ingredients, setIngredients] = useState([]);
    let [newIngredient, setNewIngredient] = useState('');
    let [loading, setLoading] = useState(false);
    let[title, setTitle]=useState('');
    let [file, setFile] = useState(null);
    let [preview, setPreview] = useState(null);
    let[description, setDescription]= useState('');
    let[errors,setErrors]=useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        let fetchRecipe = async () => {
            if (id) {
                let res = await axios.get('/api/recipes/' + id);
                if (res.status === 200) {
                    setPreview(import.meta.env.VITE_BACKEND_URL +res.data.photo)
                    setTitle(res.data.title);
                    setDescription(res.data.description);
                    setIngredients(res.data.ingredients);
                }
            }
        }

        fetchRecipe();
    }, [id])

        let addIngredient = () => {
        setIngredients(prev => [newIngredient, ...prev])
        setNewIngredient('');
        }

        let createRecipe =async(e)=>{
            try {
                e.preventDefault();
                setLoading(true);
                let recipe = {
                    title,
                    description,
                    ingredients
                };
                let res;
                if (id) {
                    res = await axios.patch('/api/recipes/' + id, recipe);
                } else {
                    res = await axios.post('/api/recipes', recipe);
                }
    
                // file
                let formData = new FormData;
                formData.set('photo', file);
    
                //upload
                let uploadRes = await axios.post(`/api/recipes/${res.data._id}/upload`, formData, {
                    headers: {
                        Accept: "multipart/form-data"
                    }
                })
                console.log(uploadRes);
                if (res.status === 200) {
                    setLoading(false);
                    navigate('/');
                }
            } catch (e) {
                setLoading(false);
                setErrors(Object.keys(e.response.data.errors));
            }
        }
        let upload = (e) => {
            let file = e.target.files[0];
            setFile(file);
            //preview
            let fileReader = new FileReader;
    
            fileReader.onload = (e) => {
                setPreview(e.target.result);
            }
    
            fileReader.readAsDataURL(file);
        }

    return (
        <div className="mx-auto max-w-md border-2 border-white p-4">
            <h1 className="mb-6 text-2xl font-bold text-orange-400 text-center">Recipe {id ? 'Edit' : 'Create'} Form</h1>
            <form className="space-y-5" onSubmit={createRecipe}>
                <ul className='list-disc pl-3'>
                    {!!errors.length && errors.map((error, i) => (
                        <li className='text-red-500 text-sm' key={i}>{error} is invalid value</li>
                    ))}
                </ul>
                <input type="file" onChange={upload} />
                {preview && <img src={preview} alt="" />}
                <input value={title} onChange={e=> setTitle(e.target.value)} type="text" placeholder="Recipe Title" className="w-full p-1" />
                <textarea value={description} onChange={e=> setDescription(e.target.value)} placeholder="Recipe Description" rows="5" className="w-full p-1" />
                <div className="flex space-x-2 items-center">
                    <input type="text" value={newIngredient} onChange={e => setNewIngredient(e.target.value)} placeholder="Recipe Ingredient" className="w-full p-1" />
                    <img src={plus} alt="" className='cursor-pointer' onClick={addIngredient}/>
                </div>
                <div>
                    <Ingredients  ingredients={ingredients} />
                </div>
                <button type='submit' className='w-full px-3 py-1 rounded-full bg-orange-400 text-white flex items-center justify-center'>
                    {loading && <svg className="motion-reduce:hidden animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>}
                    {id ? 'Update' : 'Create '} Recipe</button>
            </form>
        </div>
    )
}
