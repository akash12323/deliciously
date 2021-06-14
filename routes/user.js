const express = require('express');
const Favourite = require('../models/favourite');
const User = require('../models/user');
const router = express.Router();
const axios = require('axios');
const {isLoggedIn} = require('../middleware');



router.get('/user/:userId/favourites', isLoggedIn , async(req,res)=>{
    const user = await User.findById(req.params.userId).populate('favourites');

    res.render('user/favourite',{favourites:user.favourites});
})

router.post('/user/:userId/favourites/:mealId', isLoggedIn ,async(req,res)=>{
    try{
        const {userId,mealId} = req.params;
        
        const x = await User.findById(userId).populate('favourites');
        let alreadyExists = false;

        for(let favourite of x.favourites){
            if(favourite.key == mealId){
                alreadyExists = true;
                break;
            }
        }

        if(!alreadyExists){
            const meal =await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);

            const image = meal.data.meals[0].strMealThumb;
            const mealName = meal.data.meals[0].strMeal;
    
            const fav = await Favourite.create({img:image, name:mealName, key:req.params.mealId,category:meal.data.meals[0].strCategory});
            
            const user = req.user;
            user.favourites.push(fav);
            user.save();
    
            res.redirect(`/user/${userId}/favourites`);
        }
        req.flash('success','Item already present in your favourites');
        res.redirect(`/meals`);
    }
    catch(e){
        req.flash('error','Could not add to your favourites, Try again!!!');
        res.redirect('/meals');
    }
});



//to view recipie
router.get('/user/:userId/favourites/:id', isLoggedIn ,async(req,res)=>{
    const fav = await Favourite.findById(req.params.id);
    const meal = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${fav.key}`);

    res.render('user/favouriteDetails',{meals:meal.data.meals,fav});
})


//to remove from favourites
router.delete('/user/:userId/favourites/:id', isLoggedIn ,async(req,res)=>{
    const {userId,id} = req.params;
    await Favourite.findByIdAndDelete(id);
    const meal = await User.findByIdAndUpdate(userId, {$pull:{favourites: id}});

    res.redirect(`/user/${userId}/favourites`);
})



//to view all orders
router.get('/user/:id/me', isLoggedIn, async(req, res) => {
    try {
        const userInfo = await User.findById(req.params.id).populate({ 
          path: 'orders',
          populate: {
            path: 'orderedProducts',
            model: 'Cart'
          } 
        })
  
        res.render('user/myorders',{orders:userInfo.orders});
    }
    catch (e) {
          console.log(e.message);
          req.flash('error', 'Cannot Place the Order at this moment.Please try again later!');
          res.redirect('/meals');
    } 
  })


  router.get('/user/:userid/paymentinfo',isLoggedIn, (req, res) => {
    console.log(req.query.amount);
    res.render(`payment/payment`,{amount:req.query.amount,email:req.query.email});
  })




module.exports = router;