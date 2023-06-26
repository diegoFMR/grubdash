const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//Validation 
function validate(req, res, next){
  res.locals.data = req.body.data;
    //saving each prop in a const in order to validate
    const {name, description, image_url, price } = res.locals.data;

    if(!name || name == "" )return res.status(400).send({error: "name"});
    if(!description ) return res.status(400).send({error: "description"});
    if(!image_url || image_url == "" )return res.status(400).send({error: "image_url"});
    if(!price || price == 0 || price < 0 || !Number.isInteger(price))return res.status(400).json({error:"price"});

    //retrieving new ID
    
    next();
}

function foundValidation(req, res, next){
  res.locals.paramId = req.params.id;
  res.locals.indexFound = dishes.findIndex(d=>d.id === res.locals.paramId);
  //returns 400 if the dish is not found
  if(res.locals.indexFound == -1)return res.status(req.method === 'DELETE'? 405:404 ).json({error: ''});
  next();
}

  //updates the dish if data.id is empty, even though it does not match :dishId in the route
function notMatchValidation(req, res, next){
  if(res.locals.data.id){
    //returns 400 if data.id does not match :dishId in the route
    if(res.locals.data.id !== res.locals.paramId) return res.status(400).json({error: `data_id: ${res.locals.data.id}  param_id: ${res.locals.paramId}`});
  }
  next();
}

function create(req, res){
    //insert data
    dishes.push(res.locals.data);
    res.status(201).send({data: {...res.locals.data, id: nextId()}})
}

function read(req, res){
    return res.status(200).json({data: dishes[res.locals.indexFound] });
}

function destroy(req, res){

  const {id} = req.params;

  res.locals.indexFound  = dishes.findIndex(d=>d.id === id);

  if(res.locals.indexFound == -1) return res.status(405).json({error:"not found"});
    return res.status(405).json({error:"expected"});
}

function list(req, res){

  return res.status(200).json({data:dishes});
}

function update(req, res){
  //replacing the element in the array at index found
  dishes.splice(res.locals.indexFound, 1, { ...res.locals.data, id: res.locals.paramId });

  res.status(200).json({data: dishes[res.locals.indexFound]})
}

module.exports = {
    create: [validate, create],
    read: [foundValidation, read],
    delete: [foundValidation, destroy],
    list,
    update: [foundValidation, validate, notMatchValidation, update]
};
