const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require("./swagger.json");
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const user = users.find((users) => {
    return users.username === username;
  })

  if (user) {
    request.user = user;
    next();
  } else {
    response.status(404).json({ error: "User not found" });
  }
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => {
    return user.username === username;
  })

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);

  return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;
  const id = request.params.id;
  const todo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      return todo;
    }
  })

  if (!todo) {
    return response.status(404).json({ error: 'Not found' });
  }
  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const id = request.params.id;

  const todo = user.todos.find((todo) => {
    return todo.id === id
  })
  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  if (todo.done === true) {
    return response.send();
  }
  user.todos.splice(todo, 1);
  todo.done = true;
  user.todos.push(todo);

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const id = request.params.id;

  const todo = user.todos.find(item => {
    return item.id === id;
  })

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});


module.exports = app;