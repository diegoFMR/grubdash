
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function orderNotPending(req, res, next){
  if(orders[res.locals.indexFound].status !== 'pending' ) return res.status(400).send({error: 'pending'});
  next()
}

//returns response if the status is pending
function statusValidation(req, res,next){ 
    if(res.locals.data.status !== 'pending'){  
      return res.status(400).send({error: 'status'});
    } 
  next();
}

function foundValidation(req, res,next){
  res.locals.paramId = req.params.id;

  //check if found
  res.locals.indexFound = orders.findIndex(order=>order.id == res.locals.paramId );
  if(res.locals.indexFound == -1) return res.status(404).send({error: res.locals.paramId});
  next();
}

function validation(req, res,next){
  res.locals.data = req.body.data;
    
    //VALIDATION
    const {deliverTo, mobileNumber, dishes } = res.locals.data;
    if(!deliverTo || deliverTo === "") return res.status(400).send({error: "deliverTo "})
    if(!mobileNumber || mobileNumber === "") return res.status(400).send({error: "mobileNumber "})
    if(!Array.isArray(dishes)) return res.status(400).send({error: "dishes "})
    if(dishes.length == 0) return res.status(400).send({error: "dishes "})
    //validate prices
    const found = dishes.find(dish=>dish.quantity === 0 || !Number.isInteger(dish.quantity));
    if(found) return res.status(400).send({error: "1 2 0 quantity"})
    //validate id if it's sent 
    if(res.locals.data.id){
      if( res.locals.paramId !== res.locals.data.id) return res.status(400).json({error: "id "+res.locals.data.id});
    }
    next();
}

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req, res){
  try{
    
    //Retrieve id and push it
    const newOrder = {id: nextId(), ...res.locals.data};
    orders.push(newOrder);

    return res.status(201).json({data: newOrder});
  }catch(e){
    console.log(e);
    return res.status(500).send({error: e})
  }
   
}

function read(req, res){
  
  return res.status(200).json({data: orders[res.locals.indexFound]}); 
   
}

function update(req, res){
  try{
    //updating
    orders.splice(res.locals.indexFound, 1, { ...res.locals.data, id: res.locals.paramId});

    return res.status(200).json({data: orders[res.locals.indexFound]});
  }catch(e){
    console.log(e)
    return res.status(500).json({error: e});
  }

}

function destroy(req, res){

  //delete record
  orders.splice(res.locals.indexFound, 1);

  return res.status(204).send();
 
}

function list(req, res){
return res.status(200).send({data:orders});
    
}


module.exports = {
    create: [validation, create],
    read: [foundValidation, read],
    update: [foundValidation, validation, statusValidation, update],
    delete: [foundValidation, orderNotPending,destroy],
    list
};
