import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { useState } from "react";
import { Header } from "@/components/header";

export default function Home() {


  const { data:session } =useSession();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
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

  const handleAddTodo = () => {
    // Check if title or description is not entered
    if (!title.trim() || !details.trim()) {
      alert("Please enter both title and description");
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
  return (
    <div>
      <Header/>
    <div className="flex flex-col justify-center items-center">
      
      <div className="flex flex-col">
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
        <button
          onClick={handleAddTodo}
          className="bg-blue-400 text-white px-4 py-2 rounded-md shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        >Add Todo</button>
      </div>
      { data?.map((todo) => (
        <div className="flex items-center gap-2 bg-gray-100 p-4 rounded-md mb-2 mt-2" key={todo.id}>
          <input 
            type="checkbox"
            style={{ zoom: 1.5 }}
            checked={!!todo.done}
            className="form-checkbox h-6 w-6 text-teal-400 focus:ring-teal-400"
            onChange={() => {
              setDoneMutate({ 
                id: todo.id,
                done: todo.done ? false : true
              })
            }}
        />
        <div className="flex flex-col justify-start">
      <p className="text-lg font-semibold">{ todo.title }</p>
      <p className="text-gray-500">{todo.details}</p>
      <h4 className={todo.done ? "text-green-500":"text-red-400"}>
        {todo.done ? "Complete":"Incomplete"}
      </h4>
    </div>
        <button 
          onClick={() => deleteMutate(todo.id)}
          className="text-white bg-red-500 px-4 py-2 rounded-md shadow ml-auto font-bold "
        >
          Delete
        </button>
      </div>
    ))}
    </div>
    </div>
  );
}
