import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Header } from "@/components/header";
import  Landing  from "@/components/Home"
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

interface Todo {
  id: string;
  title: string;
  details: string;
  done: boolean

};

export default function Home() {

  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [editId, setEditId] = useState("");
 
  const ctx = api.useUtils();
  const { data, isLoading: todosLoading} =
    api.todo.getTodosByUser.useQuery(session?.user?.id ?? "");

  const { mutate } = api.todo.createTodo.useMutation({

    onSuccess: () => {
      setTitle("");
      setDetails("");
      void ctx.todo.getTodosByUser.invalidate()
    }
  })
  const { mutate: setDoneMutate } = api.todo.setDone.useMutation({
    onSuccess: () => {
      void ctx.todo.getTodosByUser.invalidate();
    }
  })
  const { mutate: deleteMutate } = api.todo.deleteTodo.useMutation({
    onSuccess: () => {
      void ctx.todo.getTodosByUser.invalidate();
    }
  })

  const { mutate: editMutate } = api.todo.editTodo.useMutation({
    onSuccess: () => {
      console.log("first")
      setTitle("");
      setDetails("");
      setEditId("")
      void ctx.todo.getTodosByUser.invalidate();
    },
  });


  const handleAddTodo = () => {

    if (!title.trim() || !details.trim()) {
      alert("Please enter both title and details");
      return;
    }


    mutate({
      userId: session?.user.id ?? "",
      title: title,
      details: details,
      done: false
    });

  };


  const handleEdit = (todo: Todo) => {
    setTitle(todo.title);
    setDetails(todo.details);
    setEditId(todo.id);

  };

if(todosLoading){
  return<>
  <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  </>
}
  return (
    <div className="w-9/10 bg-gray-50">
      <Header />
      {!session ?
        <Landing /> :
        <div className="flex flex-col justify-center items-center">

          <div className="flex flex-col m-auto">
            <input
              type="text"
              placeholder="Title"
              value={title}
              disabled={todosLoading}
              onChange={(e) => setTitle(e.target.value)}
              className="my-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Details of todo..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="my-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />

            {editId ? (
              <button
                onClick={() => editMutate({ id: editId, title: title, details: details })}
                className="bg-blue-400 text-white px-4 py-2 rounded-md shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >
                Save Edit
              </button>
            ) : (

              <button
                onClick={handleAddTodo}
                className="bg-blue-400 text-white px-4 py-2 rounded-md shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >Add Todo</button>
            )}

          </div>
          <div className="w-1/2 gap-3 my-4">
            {data?.map((todo, index) => (
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3 rounded-md mb-2 mt-4" key={index}>
                <input
                  type="checkbox"
                  style={{ zoom: 1.1 }}
                  checked={!!todo.done}
                  className="form-checkbox h-6 w-6 text-teal-400 focus:ring-teal-400"
                  onChange={() => {
                    setDoneMutate({
                      id: todo.id,
                      done: todo.done ? false : true
                    })
                  }}/>

                <div className={`flex flex-col justify-start w-3/4  ${todo.done ? 'line-through' : ''}`}>
                  <p className={`text-lg font-semibold`}>
                    {todo.title}
                  </p>
                  <p className={`text-gray-500 }`}>
                    {todo.details}
                  </p>
                 
                </div>

                <div className="flex gap-2 flex-wrap">
                  <EditIcon sx={{ color: "green" }}
                    onClick={() => handleEdit(todo)}
                    className="w-[70%] m-auto cursor-pointer"
                  />
                  <DeleteForeverIcon sx={{ color: "red" }}
                    onClick={() => deleteMutate(todo.id)}
                    className="w-[70%] m-auto cursor-pointer "
                  />

                </div>
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  );
}
