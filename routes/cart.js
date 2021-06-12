const express = require('express');
const User = require('../models/user');
const router = express.Router();
const axios = require('axios');
const {isLoggedIn} = require('../middleware');
const Cart = require('../models/cart');




router.get('/user/:userId/cart', isLoggedIn, async(req,res)=>{
    const user = await User.findById(req.params.userId).populate('cart');

    res.render('user/cart',{cartItems: user.cart,user});
});


//to add to cart
router.post('/user/:userId/cart/:mealId',isLoggedIn,async(req,res)=>{
    try{
        const {userId,mealId} = req.params;
        const user = req.user;

        const x = await User.findById(userId).populate('cart');
        let alreadyExists = false;
        for(let item of x.cart){
            if(item.key == mealId){
                const i = {
                    key:item.key,
                    img:item.img,
                    name:item.name,
                    category:item.category,
                    price:item.price,
                    quantity:item.quantity+1
                }
                await Cart.findByIdAndUpdate(item._id,i);
                alreadyExists = true;
                break;
            }
        }
        
        if(!alreadyExists){
            const meal = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.params.mealId}`);

            const image = meal.data.meals[0].strMealThumb;
            const mealName = meal.data.meals[0].strMeal;
            const p = Math.floor(Math.random()*50) + 150;
        
            const dish = await Cart.create({
                img:image,
                name:mealName, 
                key:req.params.mealId,
                category:meal.data.meals[0].strCategory,
                price:p
            });   
            user.cart.push(dish);
            user.save();
        }
    
        res.redirect(`/user/${req.params.userId}/cart`);
    }
    catch(e){
        res.redirect(`/meals`);
    }
});


//to delete from cart

router.delete('/user/:userId/cart/:id',isLoggedIn,async(req,res)=>{
    try{
        await Cart.findByIdAndDelete(req.params.id);
        await User.findByIdAndUpdate(req.params.userId, {$pull:{cart:req.params.id}});

        res.redirect(`/user/${req.params.userId}/cart`);
    }
    catch(e){
        res.redirect(`/user/${req.params.userId}/cart`);
    }
})




module.exports = router;