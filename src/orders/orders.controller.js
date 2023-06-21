
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req, res){
  try{
    const { data } = req.body;
    //VALIDATION
    const {deliverTo, mobileNumber, dishes } = data;
    if(!deliverTo || deliverTo === "") return res.status(400).send({error: "deliverTo "})
    if(!mobileNumber || mobileNumber === "") return res.status(400).send({error: "mobileNumber "})
    if(!Array.isArray(dishes)) return res.status(400).send({error: "dishes "})
    if(dishes.length == 0) return res.status(400).send({error: "dishes "})

    const found = dishes.find(dish=>dish.quantity === 0 || !Number.isInteger(dish.quantity));
    if(found) return res.status(400).send({error: "1 2 0 quantity"})
    //Retrieve id and push it
    const id = nextId();
    const newOrder = {id, ...data};
    orders.push(newOrder);

    return res.status(201).json({data: newOrder});
  }catch(e){
    console.log(e);
    return res.status(500).send({error: e})
  }
   
}

function read(req, res){
  
  const {id} = req.params;

  res.locals.orderFound = orders.find(or=>or.id == id);
  if(res.locals.orderFound) return res.status(200).json({data: res.locals.orderFound}); 
  return res.status(404).json({error: "error"});
   
}

function update(req, res){
  try{
    const {id} = req.params;
    const {data} = req.body;


    res.locals.indexFound = orders.findIndex(order=>order.id == id);

    if(res.locals.indexFound == -1) return res.status(404).json({error: "error"});
    //VALIDATION
      
    if(data.id){
      if( id !== data.id) return res.status(400).json({error: "id "+data.id});
    }
    
    if(!data.deliverTo || data.deliverTo == '') return res.status(400).json({error:"deliverTo"});
    if(!data.mobileNumber || data.mobileNumber == '')return res.status(400).json({error:"mobileNumber"});
    if(!data.dishes || data.dishes == '' || !Array.isArray(data.dishes)) return res.status(400).json({error:"dish"});
    if(!data.status || data.status == '' || data.status == "invalid") return res.status(400).json({error:"status"});

    let flag;
    data.dishes.forEach(d => {
        if(!d.quantity|| d.quantity == 0 || !Number.isInteger(d.quantity)) flag = true;
    });

    if(flag) return res.status(400).json({error: `quantity 1 0 2`})

    //updating
    orders.splice(res.locals.indexFound, 1, { ...data, id});

    return res.status(200).json({data: orders[res.locals.indexFound]});
  }catch(e){
    console.log(e)
    return res.status(500).json({error: e});
  }

}

function destroy(req, res){

  const {id} = req.params;

  //check if found
  res.locals.indexFound = orders.findIndex(order=>order.id == id );
  if(res.locals.indexFound == -1) return res.status(404).send({error: id});
  //checking status of found
  if(orders[res.locals.indexFound].status !== 'pending') return res.status(400).send({error: 'pending'});

  //delete record
  orders.splice(res.locals.indexFound, 1);

  return res.status(204).send();
 
}

function list(req, res){
return res.status(200).send({data:orders});
    
}


module.exports = {
    create: create,
    read,
    update,
    delete: destroy,
    list
};
