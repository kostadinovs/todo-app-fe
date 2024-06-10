import './App.css';
import Api from './Api';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sorting, setSorting] = useState('');
  const [order, setOrder] = useState(1);
  const [search, setSearch] = useState('');

  const getTodos = async () => {
    const response = await Api()
      .get(`/todos?page=${page}&pageSize=${pageSize}&sortBy=${sorting}&order=${order}&title=${search}`);
    console.log(response);
    if (response.data) {
      setTodos(response.data);
    }
  };

  const saveTodo = async () => {
    await Api().post('/todos', {
      title,
      description,
    });
    setTitle('');
    setDescription('');
    getTodos();
  };

  const deleteTodo = async (id) => {
    try {
      await Api().delete(`/todos/${id}`);
    } catch (error) {
      console.log(error.response.data.error);
      setError(error.response.data.error);
    } finally {
      getTodos();
    }
  };

  const editTodo = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  const updateTodo = async (id) => {
    await Api().put(`/todos/${id}`, {
      title: editTitle,
      description: editDescription,
    });
    setEditingId(null);
    getTodos();
  };

  const register = async () => {
    try {
      const result = await Api().post('/users/register', {
        username,
        password,
      });
      const jwt = result.data.token;
      localStorage.setItem('jwt', jwt);
      setUser(jwt);
    } catch (error) {
      setAuthError(error.response.data.error);
    }
  };

  const login = async () => {
    try {
      const result = await Api().post('/users/login', {
        username,
        password,
      });
      const jwt = result.data.token;
      localStorage.setItem('jwt', jwt);
      setUser(jwt);
    } catch (error) {
      setAuthError(error.response.data.error);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
  };

  useEffect(() => {
    if (user) {
      getTodos();
    }
  }, [page, sorting, order, search, user]);

  return (
   !user ? (
      <div>
        <h1>Login or register</h1>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username"
        />
        <input 
          type="text" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password"
        />
        <button onClick={register}>Register</button>
        <button onClick={login}>Login</button>
        <span>{authError}</span>
      </div>
    ) :
    <div className="App">
      <button onClick={logout}>Log out</button>
      <div className="modify">
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <button onClick={saveTodo}>Save</button>
      </div>
      <div>{error}</div>
      <button onClick={() => page > 1 ? setPage(page - 1) : null}>Previous Page</button>
      { page }
      <button onClick={() => setPage(page + 1)}>Next Page</button>
      <button onClick={() => {
        setSorting('title');
        setOrder(order === 1 ? -1 : 1 );
      }}>
        Title - {order === 1 ? 'Ascending' : 'Descending'}
      </button>
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="todos">
        {todos.map((todo) => (
          <div className="todo">
            {
              editingId === todo._id ?
              (
              <div className="modify"> 
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              )
              :
              (<div>
                <div>{todo.title}</div>
                <div>{todo.description}</div>
              </div>)
            }
            <button 
              className="delete" 
              onClick={() => deleteTodo(todo._id)}
            >
              X
            </button>
            {
              editingId === todo._id ?
             
              <button 
                className="save" 
                onClick={() => updateTodo(todo._id)}
              >
                Save
              </button>
              :
              <button 
                className="edit" 
                onClick={() => editTodo(todo)}
              >
                Edit
              </button>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
