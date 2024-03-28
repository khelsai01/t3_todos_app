import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { useState } from "react";
import { Header } from "@/components/header";

interface Todo {
  id: string;
  title: string;
  details: string;
 
}

export default function Home() {


  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  // edit 
  const [editId, setEditId] = useState(null);

  const ctx = api.useUtils();
  const { data, isLoading: todosLoading } =
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

  // const { mutate: editMutate } = api.todo.editTodo.useMutation({
  //   onSuccess: () => {
  //     setTitle("");
  //     setDetails("");
  //     void ctx.todo.getTodosByUser.invalidate();
  //     setEditId(null)
  //   },
  // });


  const handleAddTodo = () => {
    // Check if title or description is not entered
    if (!title.trim() || !details.trim()) {
      alert("Please enter both title and details");
      return;
    }

    // Submit todo
    mutate({
      userId: session?.user.id ?? "",
      title: title,
      details: details,
      done: false
    });
  };

  // edit handle
  const handleEdit = (todo:Todo) => {
    // console.log(todo)
    setTitle(todo.title);
    setDetails(todo.details);
    // setEditId(todo.id);
  };


  const handleSaveEdit = () => {
 

    if (!title.trim() || !details.trim()) {
      alert("Please enter both title and details");
      return;
    }
    
    // mutate({
    //   id: editId,
    //   title: title,
    //   details: details,
    // });
    setEditId(null);
  };

  return (
    <div className="w-9/10 bg-gray-50">
      <Header />
      <div className="flex flex-col justify-center items-center">

        <div className="flex flex-col m-auto">
          <input
            type="text"
            placeholder="Title"
            value={title}
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
              onClick={handleSaveEdit}
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
        <div className="w-full md:w-9/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

          {data?.map((todo) => (
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3 rounded-md mb-2 mt-2" key={todo.id}>
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
                }}
              />
              <div className="flex flex-col justify-start w-3/4">

                <p className="text-lg font-semibold">{todo.title}</p>
                <p className="text-gray-500">{todo.details}</p>
                <h4 className={todo.done ? "text-green-500" : "text-red-500"}>
                  {todo.done ? "Complete" : "Incomplete"}
                </h4>
              </div>
              <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleEdit(todo)}
                className="w-[70%] text-white text-[1.1rem] font-normal bg-gray-500 px-4 py-2 border-none rounded-md shadow ml-auto font-bold"
              >
                Edit
              </button>

              <button
                onClick={() => deleteMutate(todo.id)}
                className="w-[70%] text-[1.1rem] font-normal text-white bg-red-500 px-4 py-2 border-none rounded-md shadow ml-auto font-bold "
              >
                Delete
              </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
