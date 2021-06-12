const express = require('express');
const router = express.Router();
const axios = require('axios');
const {isLoggedIn} = require('../middleware');


router.get('/',(req,res)=>{
    res.render('meals/home');
})



router.get('/meals',async(req,res)=>{
    try{
        const meals = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');

        res.render('meals/mealCategories',{categories:meals.data.categories});
    }
    catch(e){
        console.log(e.message);
    }
})

//search meal
router.get('/meals/search',async(req,res)=>{
    try{
        const mealName = req.query.mealName;
        const meal = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`);

        res.render('meals/search',{meals:meal.data.meals});
    }
    catch(e){
        req.flash('error','Failed to load response');
        res.redirect('/meals');
    }
})


router.get('/meals/:categoryName' ,async(req,res)=>{
    const meals = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');

    const filterMeals = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${req.params.categoryName}`);

    res.render('meals/filterMeals',{meals:filterMeals.data.meals, category:req.params.categoryName,categories:meals.data.categories});
})


router.get('/meals/:categoryName/:mealId',isLoggedIn,async(req,res)=>{
    const meal = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.params.mealId}`);
    
    res.render('meals/recipie',{meals:meal.data.meals});
})





module.exports = router;