const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res){

    const {data} = req.body;
    //saving each prop in a const in order to validate
    const {name, description, image_url, price } = data;

    if(!name || name == "" )res.status(400).send({error: "name"});
    if(!description )res.status(400).send({error: "description"});
    if(!image_url || image_url == "" )res.status(400).send({error: "image_url"});
    if(!price || price == 0 || price < 0 )res.status(400).send({error: "price"});
    //retrieving new ID
    data.id = nextId();   
    //insert data
    dishes.push(data);
 
    res.status(201).send({data: data})
}

function read(req, res){

    const {id} = req.params;

    res.locals.dishFound = dishes.find(d=>d.id == id);
    if(!res.locals.dishFound)return res.status(404).json({error:"err"});
    return res.status(200).json({data:res.locals.dishFound});
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
  

  const {id} = req.params;
  const {data} = req.body;

  res.locals.indexFound = dishes.findIndex(d=>d.id === id);
  //returns 400 if the dish is not found
  if(res.locals.indexFound == -1)return res.status(404).json({error: ''});
  //updates the dish if data.id is empty, even though it does not match :dishId in the route
  if(data.id){
    //returns 400 if data.id does not match :dishId in the route
    if(data.id !== id) return res.status(400).json({error: `id ${data.id}`});
  } 

  //validation of props from the data
  if(!data.name || data.name == '') res.status(400).json({error:"name"});
  if(!data.description || data.description == '') res.status(400).json({error:"description"});
  if(!data.image_url || data.image_url == '') res.status(400).json({error:"image_url"});
  if(!data.price || data.price == 0 || data.price < 0 || !Number.isInteger(data.price)) res.status(400).json({error:"price"});

  //replacing the element in the array at index found
  dishes.splice(res.locals.indexFound, 1, { ...data, id: id });

  res.status(200).json({data: dishes[res.locals.indexFound]})
}

module.exports = {
    create: create,
    read,
    delete: destroy,
    list,
    update
};
