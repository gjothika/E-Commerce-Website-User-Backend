const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


mongoose
  .connect("mongodb+srv://jothika:jothika@cluster0.uyxgqyk.mongodb.net/EcommerceDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


const CategorySchema = new mongoose.Schema({
  image: String,
  name: String,
});
const Category = mongoose.model("Category", CategorySchema);


const BrandSchema = new mongoose.Schema({
  image: String,
});
const Brand = mongoose.model("Brand", BrandSchema);


const CardSchema = new mongoose.Schema({
  image: String,
  name:String,
})
const Card = mongoose.model("Card",CardSchema);

const ProductSchema =new mongoose.Schema({
  image: String,
  name: String,
  description:String,
  selling_price: String,
  actual_price: String,
  discount: String,
  ratings: String,
  rating: String,
  reviews: String,
  color: String,
  size: {
    type:Object
  },
  specifications:{
    type:Object
  },
  variants:[
    {
      _id:{
        type:mongoose.Schema.Types.ObjectId,auto:true
      },
      image: String,
      color: String,
      size: {
        type:Object
      },
      specifications:{
      type:Object
      },
      selling_price: String,
      actual_price: String,
      discount: String,
      sku: String,
      stock:{
         type:Number,
         default:0
          } 
    }
  ]
})
const Product = mongoose.model("Product",ProductSchema);

const UserSchema = new mongoose.Schema({
  Email: String,
  Password: String,
  FirstName: String,
  LastName: String,
})
const User = mongoose.model("User",UserSchema)


const CartSchema = new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
   variant:{
    _id:String,
    image:String,
    selling_price: String,
    actual_price: String,
    discount: String,
    color: String,
    size: {
        type:Object
      },
    sku: String,
  }
  ,
    quantity:{
    type:Number,
    default:1
  }
}
// {timestamps:true}
);
const Cart = mongoose.model("Cart",CartSchema)


const WishlistSchema = new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
   variant:{
    _id:String,
    image:String,
    selling_price: String,
    actual_price: String,
    discount: String,
    color:String,
    size: {
        type:Object
      },
    sku:String
  }
}
);
const Wishlist = mongoose.model("Wishlist",WishlistSchema)


const AddressSchema = new mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  name:String,
  contact_no:Number,
  house_no:String,
  area:String,
  pincode:Number,
  city:String,
  state:String,
  landmark:String,
})
const Address = mongoose.model("Address",AddressSchema);

const OrderSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  productName:String,
  price:Number,
  size:String,
  quantity:Number,
  paymentMethod:String,
  image:String,
  status:{
    type:String,
    default:"Ordered"
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
  address:{
     name:String,
  contact_no:Number,
  house_no:String,
  area:String,
  pincode:Number,
  city:String,
  state:String,
  landmark:String,
  },

})
const Order = mongoose.model("Order",OrderSchema);


app.get("/Category", async (req, res) => {
  console.log("✅GET /getdata HIT");
  const categories = await Category.find({});
  res.json(categories);
});

app.get("/Brand",async (req,res)=>{
  const brands = await Brand.find({});
  res.json(brands);
})

app.get("/Product",async(req,res)=>{
  const products = await Product.find({});
  res.json(products);
})

app.get("/Card",async(req,res)=>{
  const cards = await Card.find({});
  res.json(cards);
})

app.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  const user = await User.findOne({ Email, Password });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
     _id: user._id,
    FirstName: user.FirstName,
    LastName: user.LastName,
    Email: user.Email
  });
});

app.post("/register", async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password } = req.body;

    const existingUser = await User.findOne({ Email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      FirstName,
      LastName,
      Email,
      Password,
    });

    await newUser.save();

    res.status(200).json({ message: "Registered Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/cart", async (req,res)=>{

const {userId, productId, variant, quantity} = req.body

let exists

if(variant){
   exists = await Cart.findOne({
      userId,
      productId,
      "variant.sku":variant.sku
   })
}else{
   exists = await Cart.findOne({
      userId,
      productId,
      variant:null
   })
}

if(exists){
   exists.quantity += 1
   await exists.save()
   return res.json({
    exists:true,
    item:exists
 } )
}

const newItem = await Cart.create({
   userId,
   productId,
   variant: variant || null,
   quantity
})

res.json(newItem)

})
app.get("/Cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.find({userId})
      .populate("productId"); 

    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/cartCount/:userId", async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.params.userId });
    res.json({ count: items.length });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }                                                                                     
});

app.delete("/Cart/:id", async(req, res)=>{
  await Cart.findByIdAndDelete(req.params.id)
  res.json({message:"Removed"})
});

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      product:product,
      variants:product.variants
    }); 

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});         

app.post("/wishlist", async(req,res)=>{
  const {userId, productId, variant} = req.body

  const exists = await Wishlist.findOne({
    userId,
    productId,
    "variant.sku": variant?.sku
  })

  if(exists) return res.json({message:"Already exists"})

  const newItem = await Wishlist.create({
    userId,
    productId,
    variant
  })

  res.json(newItem)
})

app.get("/wishlist/:userId" ,async (req, res)=>{
  try{
    const{userId}=req.params;
    const wishlistItems=await Wishlist.find({userId})
    .populate("productId")
    res.json(wishlistItems);
  }catch(err){
  res.status(500).json({ error: "Server error" });
  }
})

app.get("/wishlistCount/:userId", async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.params.userId });
    res.json({ count: items.length });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }                                                                                     
});


app.delete("/Wishlist/:id",async(req, res)=>{
  await Wishlist.findByIdAndDelete(req.params.id)
  res.json({message:"Removed"})
})

app.delete("/Wishlist/:productId/:userId",async(req, res)=>{
    const{productId,userId}=req.params
    await Wishlist.deleteOne({productId,userId})
    res.json({message:"removed"})
})

app.post("/address",async(req,res)=>{
  try{
    const newAddress = new Address(req.body)
    await newAddress.save()
     res.json({
      message:"Address saved successfully"
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({error:"Server error"})
  }
})

app.get("/address/:userId",async(req,res)=>{
  try{
    const address = await Address.find({userId:req.params.userId})
    res.json(address)
  }catch(err){
    res.status(500).json(err)
  }
})

app.put("/address/:id",async(req,res)=>{
  try{
    const updatedAddress = await Address.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.json(updatedAddress)
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
})

app.post("/order",async(req,res)=>{
  try{
    const order = new Order(req.body)
    await order.save()
    res.json({
      message:"Order Placed Successfully",
      order
    })
  } catch(err){
      console.log(err)
      res.status(500).json(err)
    }
})

  app.get("/myorders/:userId", async (req, res) => {
  try{
    const orders = await Order.find({ userId: req.params.userId })
    res.json(orders)
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
})


  app.get("/mysingleproduct/:userId/:productId", async (req,res)=>{
 try{

 const order = await Order.findOne({
  userId: req.params.userId,
  productId: req.params.productId
 }).sort({createdAt:-1})

 res.json(order)

 }catch(err){
  console.log(err)
  res.status(500).json(err)
 }
})


app.get("/allorder",async(req,res)=>{
  try{
    const orders = await Order.find({});
    res.json(orders);   
  }catch(err){
    res.status(500).json(err)
  }
})

app.get("/order/:orderId", async (req,res)=>{
 try{
 const order = await Order.findById(req.params.orderId)
 res.json(order)
 }catch(err){
  res.status(500).json(err)
 }
})

app.put("/orderstatus/:id", async (req,res)=>{
 try{

 const order = await Order.findByIdAndUpdate(
   req.params.id,
   { status:req.body.status },
   { new:true }
 )

 res.json(order)

 }catch(err){
  res.status(500).json(err)
 }
})

app.get("/cart",async(req,res)=>{
  const carts = await Cart.find({});
  res.json(carts);
})
app.get("/Wishlist",async(req,res)=>{
  const wishlists = await Wishlist.find({});
  res.json(wishlists);
})
app.get("/address",async(req,res)=>{
  const addresses = await Address.find({});
  res.json(addresses);
})


app.get("/test", (req, res) => {
  res.send("TESTING OK");
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server running");
});